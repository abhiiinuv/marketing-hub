import { MarketingCalendar } from "@/components/calendar/MarketingCalendar";
import { PageHeader } from "@/components/layout/PageHeader";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Marketing Calendar"
        description="Roadmap of tweets, video releases, collabs, and campaigns by date."
      />
      <MarketingCalendar />
    </div>
  );
}
