import { CollabManager } from "@/components/collabs/CollabManager";

export default function CollabsPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">YouTuber Collaborations</h1>
        <p className="mt-1 text-zinc-400">
          Track creator deals, costs, status, and links. Archive completed collabs to the backlog.
        </p>
      </header>
      <CollabManager />
    </div>
  );
}
