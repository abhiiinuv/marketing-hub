"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { TrafficChart } from "@/components/traffic/TrafficChart";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const { upcoming } = useMarketing();
  const upcomingCards = upcoming.slice(0, 12);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Marketing Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Traffic from your latest CSV. Hover a point to see sessions and what ran that day.
        </p>
      </header>

      <TrafficChart height={520} showControls />

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Upcoming</h2>
          <Link href="/calendar" className="text-sm text-amber-400 hover:underline">
            Full calendar →
          </Link>
        </div>

        {upcomingCards.length === 0 ? (
          <p className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center text-sm text-zinc-500">
            Nothing scheduled yet. Add posts, videos, or collabs in Content Planner or Collabs.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingCards.map((e) => (
              <article
                key={e.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
                  />
                  <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {EVENT_TYPE_LABELS[e.eventType]}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-100 line-clamp-2">{e.title}</h3>
                <p className="mt-2 text-sm text-amber-400/90">
                  {format(parseISO(e.date), "MMM d, yyyy")}
                </p>
                {e.cost != null && (
                  <p className="mt-1 text-xs text-zinc-500">${e.cost.toLocaleString()}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
