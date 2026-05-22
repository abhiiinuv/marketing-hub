const STATUS_STYLES: Record<string, string> = {
  planned: "bg-zinc-700 text-zinc-200",
  in_progress: "bg-blue-500/20 text-blue-300",
  in_production: "bg-blue-500/20 text-blue-300",
  live: "bg-emerald-500/20 text-emerald-300",
  completed: "bg-zinc-600 text-zinc-300",
  draft: "bg-zinc-700 text-zinc-300",
  scheduled: "bg-amber-500/20 text-amber-300",
  posted: "bg-emerald-500/20 text-emerald-300",
  dedicated: "bg-violet-500/20 text-violet-300",
  integration: "bg-cyan-500/20 text-cyan-300",
};

export function Badge({ label }: { label: string }) {
  const key = label.toLowerCase().replace(/\s+/g, "_");
  const style = STATUS_STYLES[key] ?? "bg-zinc-700 text-zinc-300";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}
