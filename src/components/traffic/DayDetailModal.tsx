"use client";

import { format, parseISO } from "date-fns";
import type { ChartPointWithEvents } from "@/lib/chartData";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type ChartAnnotation } from "@/lib/types";

function formatDate(date: string) {
  try {
    return format(parseISO(date), "EEEE, MMMM d, yyyy");
  } catch {
    return date;
  }
}

function EventDetail({ event }: { event: ChartAnnotation }) {
  const links: { label: string; href: string }[] = [];
  if (event.videoLink) links.push({ label: "Video", href: event.videoLink });
  if (event.channelLink) links.push({ label: "Channel", href: event.channelLink });
  if (event.link) links.push({ label: "Link", href: event.link });

  return (
    <article className="rounded-lg border border-zinc-700 bg-zinc-950/60 p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: EVENT_TYPE_COLORS[event.eventType] }}
        />
        <h3 className="font-semibold text-zinc-100">{event.title}</h3>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge label={EVENT_TYPE_LABELS[event.eventType]} />
        {event.status && <Badge label={event.status} />}
        {event.collabType && <Badge label={event.collabType} />}
      </div>
      {event.cost != null && (
        <p className="text-sm text-zinc-400">Cost: ${event.cost.toLocaleString()}</p>
      )}
      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-amber-400 hover:text-amber-300 hover:underline"
            >
              {l.label} →
            </a>
          ))}
        </div>
      )}
      {event.notes && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{event.notes}</p>
      )}
    </article>
  );
}

export function DayDetailModal({
  point,
  metricLabel,
  onClose,
}: {
  point: ChartPointWithEvents | null;
  metricLabel: string;
  onClose: () => void;
}) {
  if (!point) return null;

  return (
    <Modal open={!!point} onClose={onClose} title={formatDate(point.date)}>
      <p className="mb-4 text-sm text-zinc-400">
        {metricLabel}:{" "}
        <span className="text-lg font-semibold text-amber-400">
          {point.value != null ? point.value.toLocaleString() : "No traffic data"}
        </span>
      </p>

      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Marketing activity
      </h4>

      {point.events.length === 0 ? (
        <p className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-500">
          Nothing scheduled on this day.
        </p>
      ) : (
        <div className="space-y-3">
          {point.events.map((e) => (
            <EventDetail key={e.id} event={e} />
          ))}
        </div>
      )}
    </Modal>
  );
}
