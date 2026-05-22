import { BacklogManager } from "@/components/backlog/BacklogManager";

export default function BacklogPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-50">Collaboration Backlog</h1>
        <p className="mt-1 text-zinc-400">
          Historical record of past YouTuber collaborations and performance notes.
        </p>
      </header>
      <BacklogManager />
    </div>
  );
}
