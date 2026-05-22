import { ContentPlanner } from "@/components/content/ContentPlanner";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ContentPage() {
  return (
    <div>
      <PageHeader
        title="Content Planner"
        description="Manage tweets, video releases, in-house videos, and marketing campaigns."
      />
      <ContentPlanner />
    </div>
  );
}
