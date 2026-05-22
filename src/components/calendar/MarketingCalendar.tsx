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
import { groupEventsByDate } from "@/lib/calendar";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type CalendarEvent } from "@/lib/types";
import { Badge } from "@/components/shared/Badge";

function EventDetail({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: EVENT_TYPE_COLORS[event.eventType] }}
        />
        <span className="font-semibold text-zinc-100">{event.title}</span>
        <Badge label={EVENT_TYPE_LABELS[event.eventType]} />
        {event.status && <Badge label={event.status} />}
        {event.collabType && <Badge label={event.collabType} />}
      </div>
      <p className="text-zinc-400">{format(parseISO(event.date), "PPP")}</p>
      {event.cost != null && (
        <p className="mt-1 text-zinc-300">Cost: ${event.cost.toLocaleString()}</p>
      )}
      {event.videoLink && (
        <a href={event.videoLink} target="_blank" rel="noreferrer" className="mt-2 block text-amber-400 hover:underline">
          Video link
        </a>
      )}
      {event.channelLink && (
        <a href={event.channelLink} target="_blank" rel="noreferrer" className="mt-1 block text-amber-400 hover:underline">
          Channel link
        </a>
      )}
      {event.link && (
        <a href={event.link} target="_blank" rel="noreferrer" className="mt-1 block text-amber-400 hover:underline">
          Post link
        </a>
      )}
      {event.notes && <p className="mt-2 text-zinc-400">{event.notes}</p>}
    </div>
  );
}

export function MarketingCalendar() {
  const { calendarEvents } = useMarketing();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const byDate = useMemo(() => groupEventsByDate(calendarEvents), [calendarEvents]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-50">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setMonth(startOfMonth(new Date()))}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-zinc-950 px-2 py-2 text-center text-xs font-medium text-zinc-500">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const events = byDate.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={key}
              type="button"
              onClick={() => events[0] && setSelected(events[0])}
              className={`min-h-[88px] bg-zinc-950 p-1.5 text-left transition-colors hover:bg-zinc-900 ${
                !inMonth ? "opacity-40" : ""
              } ${isToday ? "ring-1 ring-inset ring-amber-500/50" : ""}`}
            >
              <span className={`text-xs ${isToday ? "font-bold text-amber-400" : "text-zinc-400"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {events.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-zinc-900"
                    style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                    title={e.title}
                  >
                    {e.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <span className="text-[10px] text-zinc-500">+{events.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">Selected event</h3>
          <EventDetail event={selected} />
        </div>
      )}

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
                onClick={() => setSelected(e)}
                className="flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-left hover:border-zinc-600"
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
