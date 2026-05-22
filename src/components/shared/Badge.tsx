const STATUS_STYLES: Record<string, string> = {
  planned: "bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]",
  in_progress: "bg-[var(--traycer-teal-dark)]/30 text-[var(--traycer-teal-light)] border border-[var(--traycer-teal-muted)]/40",
  in_production: "bg-[var(--traycer-teal-dark)]/30 text-[var(--traycer-teal-light)] border border-[var(--traycer-teal-muted)]/40",
  live: "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50",
  completed: "bg-[var(--surface-hover)] text-[var(--text-subtle)] border border-[var(--border)]",
  draft: "bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]",
  scheduled: "bg-[var(--traycer-teal-dark)]/20 text-[var(--traycer-teal-light)] border border-[var(--traycer-teal-muted)]/30",
  posted: "bg-emerald-950/50 text-emerald-300 border border-emerald-800/50",
  dedicated: "bg-violet-950/40 text-violet-300 border border-violet-800/40",
  integration: "bg-cyan-950/40 text-cyan-300 border border-cyan-800/40",
};

export function Badge({ label }: { label: string }) {
  const key = label.toLowerCase().replace(/\s+/g, "_");
  const style = STATUS_STYLES[key] ?? "bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}
