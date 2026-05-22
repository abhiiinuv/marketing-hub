import { ContentPlanner } from "@/components/content/ContentPlanner";

export default function ContentPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Content Planner</h1>
        <p className="mt-1 text-zinc-400">
          Manage tweets, video releases, in-house videos, and other marketing campaigns.
        </p>
      </header>
      <ContentPlanner />
    </div>
  );
}
