"use client";

import { format, parseISO } from "date-fns";
import { Modal } from "@/components/shared/Modal";
import { Badge } from "@/components/shared/Badge";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type CalendarEvent } from "@/lib/types";
import { normalizeExternalUrl } from "@/lib/urls";

function formatDayTitle(dateKey: string) {
  try {
    return format(parseISO(dateKey), "EEEE, MMMM d, yyyy");
  } catch {
    return dateKey;
  }
}

function EventCard({ event }: { event: CalendarEvent }) {
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
        {channelHref ? (
          <a
            href={channelHref}
            target="_blank"
            rel="noreferrer"
            className="link-teal font-medium hover:underline"
          >
            {event.title}
          </a>
        ) : (
          <h3 className="font-medium text-white">{event.title}</h3>
        )}
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
              key={`${l.label}-${l.href}`}
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

export function CalendarDayModal({
  date,
  events,
  onClose,
}: {
  date: string | null;
  events: CalendarEvent[];
  onClose: () => void;
}) {
  if (!date) return null;

  return (
    <Modal open={!!date} onClose={onClose} title={formatDayTitle(date)}>
      {events.length === 0 ? (
        <p className="panel-subtle px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          Nothing scheduled on this day.
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </Modal>
  );
}
