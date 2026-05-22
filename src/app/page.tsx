"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const { stats, upcoming } = useMarketing();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-50">Marketing Dashboard</h1>
        <p className="mt-1 text-zinc-400">
          Central view of upcoming marketing activities across collabs, content, and campaigns.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Upcoming events", value: stats.upcomingCount, href: "/calendar" },
          { label: "Active collabs", value: stats.activeCollabs, href: "/collabs" },
          { label: "Live collabs", value: stats.liveCollabs, href: "/collabs" },
          { label: "Backlog entries", value: stats.backlogCount, href: "/backlog" },
        ].map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition-colors hover:border-zinc-600"
          >
            <p className="text-sm text-zinc-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-amber-400">{card.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Next up</h2>
          <Link href="/calendar" className="text-sm text-amber-400 hover:underline">
            View full calendar →
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: EVENT_TYPE_COLORS[e.eventType] }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-100">{e.title}</p>
                <p className="text-xs text-zinc-500">
                  {format(parseISO(e.date), "MMM d, yyyy")} · {EVENT_TYPE_LABELS[e.eventType]}
                </p>
              </div>
              {e.cost != null && (
                <span className="text-sm text-zinc-400">${e.cost.toLocaleString()}</span>
              )}
            </div>
          ))}
          {!upcoming.length && (
            <p className="py-8 text-center text-zinc-500">
              No upcoming events. Add content in Content Planner or Collabs.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <QuickLink
          title="Upload traffic data"
          description="CSV upload with marketing pins on the chart"
          href="/traffic"
        />
        <QuickLink
          title="Track YouTuber collabs"
          description="Costs, status, links, and dedicated vs integration"
          href="/collabs"
        />
        <QuickLink
          title="Plan tweets & videos"
          description="Social posts, releases, and in-house content"
          href="/content"
        />
      </section>
    </div>
  );
}

function QuickLink({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-800 p-5 hover:border-amber-500/40 hover:bg-zinc-900/60"
    >
      <h3 className="font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </Link>
  );
}
