import { MarketingCalendar } from "@/components/calendar/MarketingCalendar";

export default function CalendarPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Marketing Calendar</h1>
        <p className="mt-1 text-zinc-400">
          Roadmap of tweets, video releases, collabs, and campaigns by date.
        </p>
      </header>
      <MarketingCalendar />
    </div>
  );
}
