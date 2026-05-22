"use client";

import { format, parseISO } from "date-fns";
import type { ChartPointWithEvents } from "@/lib/chartData";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type ChartAnnotation } from "@/lib/types";
import { normalizeExternalUrl } from "@/lib/urls";

function formatDate(date: string) {
  try {
    return format(parseISO(date), "EEEE, MMMM d, yyyy");
  } catch {
    return date;
  }
}

function EventDetail({ event }: { event: ChartAnnotation }) {
  const links: { label: string; href: string }[] = [];
  const videoHref = normalizeExternalUrl(event.videoLink);
  const channelHref = normalizeExternalUrl(event.channelLink);
  const postHref = normalizeExternalUrl(event.link);
  if (videoHref) links.push({ label: "Video", href: videoHref });
  if (channelHref) links.push({ label: "Channel", href: channelHref });
  if (postHref) links.push({ label: "Link", href: postHref });

  return (
    <article className="panel-subtle p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: EVENT_TYPE_COLORS[event.eventType] }}
        />
        <h3 className="font-medium text-white">{event.title}</h3>
      </div>
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge label={EVENT_TYPE_LABELS[event.eventType]} />
        {event.status && <Badge label={event.status} />}
        {event.collabType && <Badge label={event.collabType} />}
      </div>
      {event.cost != null && (
        <p className="text-sm text-[var(--text-muted)]">Cost: ${event.cost.toLocaleString()}</p>
      )}
      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="link-teal text-sm font-medium hover:underline"
            >
              {l.label} →
            </a>
          ))}
        </div>
      )}
      {event.notes && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{event.notes}</p>
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
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        {metricLabel}:{" "}
        <span className="text-lg font-medium text-[var(--traycer-teal-light)]">
          {point.value != null ? point.value.toLocaleString() : "No traffic data"}
        </span>
      </p>

      <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
        Marketing activity
      </h4>

      {point.events.length === 0 ? (
        <p className="panel-subtle px-4 py-6 text-center text-sm text-[var(--text-muted)]">
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
