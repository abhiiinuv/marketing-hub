"use client";

import { format, parseISO } from "date-fns";
import type { ChartPointWithEvents } from "@/lib/chartData";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export function DayChartTooltip({
  active,
  payload,
  metricLabel,
}: {
  active?: boolean;
  payload?: { payload: ChartPointWithEvents }[];
  metricLabel: string;
}) {
  if (!active || !payload?.[0]) return null;

  const point = payload[0].payload;
  const dateLabel = (() => {
    try {
      return format(parseISO(point.date), "EEEE, MMM d, yyyy");
    } catch {
      return point.date;
    }
  })();

  return (
    <div className="max-w-sm rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 text-sm shadow-2xl">
      <p className="font-serif text-base text-white">{dateLabel}</p>
      <p className="mt-1 text-[var(--traycer-teal-light)]">
        {metricLabel}:{" "}
        <span className="font-medium text-white">
          {point.value != null ? point.value.toLocaleString() : "—"}
        </span>
      </p>

      <div className="mt-3 border-t border-[var(--border)] pt-2">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
          What happened
        </p>
        {point.events.length === 0 ? (
          <p className="text-[var(--text-muted)]">No marketing events on this day.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {point.events.map((e) => (
                <li key={e.id} className="flex gap-2">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                  />
                  <div>
                    <p className="font-medium text-white">{e.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {EVENT_TYPE_LABELS[e.eventType]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[var(--text-subtle)]">Click for full details and links</p>
          </>
        )}
      </div>
    </div>
  );
}
