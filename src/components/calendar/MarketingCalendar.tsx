"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { CalendarDayModal } from "@/components/calendar/CalendarDayModal";
import { groupEventsByDate } from "@/lib/calendar";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

const VISIBLE_EVENTS_PER_DAY = 2;

export function MarketingCalendar() {
  const { calendarEvents } = useMarketing();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const byDate = useMemo(() => groupEventsByDate(calendarEvents), [calendarEvents]);
  const selectedDayEvents = selectedDay ? (byDate.get(selectedDay) ?? []) : [];

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-normal text-white">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="btn-secondary !py-1.5 !text-sm"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(new Date()))}
            className="btn-secondary !py-1.5 !text-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="btn-secondary !py-1.5 !text-sm"
          >
            Next
          </button>
        </div>
      </div>

      <div className="panel grid grid-cols-7 gap-px overflow-hidden p-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-[var(--surface)] px-2 py-2 text-center text-xs font-medium text-[var(--text-subtle)]">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = byDate.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());
          const hiddenCount = Math.max(0, events.length - VISIBLE_EVENTS_PER_DAY);

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDay(key)}
              className={`min-h-[88px] bg-black p-1.5 text-left transition-colors hover:bg-[var(--surface-hover)] ${
                !inMonth ? "opacity-40" : ""
              } ${isToday ? "ring-1 ring-inset ring-[var(--traycer-teal-muted)]" : ""}`}
              aria-label={
                hiddenCount > 0
                  ? `${format(day, "MMMM d")}, ${events.length} events, click to view all`
                  : `${format(day, "MMMM d")}, click to view events`
              }
            >
              <span className={`text-xs ${isToday ? "font-bold text-[var(--traycer-teal-light)]" : "text-[var(--text-muted)]"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, VISIBLE_EVENTS_PER_DAY).map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-zinc-900"
                    style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <span className="text-[10px] font-medium text-[var(--traycer-teal-light)]">
                    +{hiddenCount} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <CalendarDayModal
        date={selectedDay}
        events={selectedDayEvents}
        onClose={() => setSelectedDay(null)}
      />

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Upcoming timeline
        </h3>
        <div className="space-y-2">
          {calendarEvents
            .filter((e) => e.date.slice(0, 10) >= format(new Date(), "yyyy-MM-dd"))
            .slice(0, 20)
            .map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedDay(e.date.slice(0, 10))}
                className="flex w-full items-center gap-3 panel px-4 py-3 text-left transition-colors hover:border-[var(--traycer-teal-muted)]/40"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-zinc-100">{e.title}</p>
                  <p className="text-xs text-zinc-500">
                    {format(parseISO(e.date), "MMM d, yyyy")} · {EVENT_TYPE_LABELS[e.eventType]}
                  </p>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
