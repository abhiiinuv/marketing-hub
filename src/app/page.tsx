"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { TrafficChart } from "@/components/traffic/TrafficChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const { upcoming } = useMarketing();
  const upcomingCards = upcoming.slice(0, 12);

  return (
    <div>
      <PageHeader
        title="Marketing Dashboard"
        description="Traffic from your latest CSV. Hover a point for a preview, click for full details."
      />

      <TrafficChart height={520} showControls showLegend />

      <section className="relative mt-12">
        <div className="pointer-events-none absolute -left-8 top-0 h-32 w-48 rounded-full bg-[var(--traycer-teal-glow)] blur-3xl" aria-hidden />
        <div className="relative mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-normal text-white">Upcoming</h2>
          <Link href="/calendar" className="link-teal text-sm hover:underline">
            Full calendar →
          </Link>
        </div>

        {upcomingCards.length === 0 ? (
          <p className="panel-subtle px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            Nothing scheduled yet. Add posts, videos, or collabs in Content Planner or Collabs.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingCards.map((e) => (
              <article key={e.id} className="panel p-4 transition-colors hover:border-[var(--traycer-teal-muted)]/40">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/30"
                    style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
                    {EVENT_TYPE_LABELS[e.eventType]}
                  </span>
                </div>
                <h3 className="line-clamp-2 font-medium text-white">
                  {e.channelLink ? (
                    <a
                      href={e.channelLink}
                      target="_blank"
                      rel="noreferrer"
                      className="link-teal hover:underline"
                    >
                      {e.title}
                    </a>
                  ) : (
                    e.title
                  )}
                </h3>
                <p className="mt-2 text-sm text-[var(--traycer-teal-light)]">
                  {format(parseISO(e.date), "MMM d, yyyy")}
                </p>
                {e.cost != null && (
                  <p className="mt-1 text-xs text-[var(--text-subtle)]">
                    ${e.cost.toLocaleString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
