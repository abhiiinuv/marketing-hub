import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export function EventLegend() {
  return (
    <div className="panel mb-4 px-4 py-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-subtle)]">
        Chart key
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <LegendItem color="var(--chart-line)" label="Sessions (on the line)" />
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
          <LegendItem
            key={type}
            color={EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS]}
            label={`${label} (above line)`}
          />
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/40"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
