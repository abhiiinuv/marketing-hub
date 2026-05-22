"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMarketing } from "@/components/providers/MarketingProvider";
import { parseTrafficCsv, pickDefaultMetric } from "@/lib/csv";
import { addTrafficUpload, deleteTrafficUpload } from "@/lib/firestore";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export function TrafficDashboard() {
  const { canEdit } = useAuth();
  const { trafficUploads, chartAnnotations } = useMarketing();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState<string>("sessions");
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const activeUpload = useMemo(() => {
    if (selectedUploadId) {
      return trafficUploads.find((u) => u.id === selectedUploadId) ?? trafficUploads[0];
    }
    return trafficUploads[0];
  }, [trafficUploads, selectedUploadId]);

  const chartData = useMemo(() => {
    if (!activeUpload) return [];
    const m = metric || activeUpload.primaryMetric;
    return activeUpload.rows.map((row) => {
      const value = (row[m] as number) ?? row.sessions ?? row.users ?? row.pageviews ?? 0;
      return {
        date: row.date.slice(0, 10),
        value: Number(value) || 0,
        label: row.date,
      };
    });
  }, [activeUpload, metric]);

  const pins = useMemo(() => {
    if (!chartData.length) return [];
    const dates = new Set(chartData.map((d) => d.date));
    return chartAnnotations
      .filter((a) => dates.has(a.date.slice(0, 10)))
      .map((a) => {
        const point = chartData.find((d) => d.date === a.date.slice(0, 10));
        return { ...a, y: point?.value ?? 0 };
      });
  }, [chartAnnotations, chartData]);

  const availableMetrics = useMemo(() => {
    if (!activeUpload?.rows.length) return ["sessions"];
    const keys = new Set<string>();
    for (const row of activeUpload.rows) {
      Object.keys(row).forEach((k) => {
        if (k !== "date" && typeof row[k] === "number") keys.add(k);
      });
    }
    return [...keys];
  }, [activeUpload]);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const text = await file.text();
      const { rows, metrics } = parseTrafficCsv(text);
      const primaryMetric = pickDefaultMetric(metrics);
      await addTrafficUpload({
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        rows,
        primaryMetric,
      });
      setMetric(primaryMetric);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-zinc-300">Upload traffic CSV</label>
          <p className="mb-2 text-xs text-zinc-500">
            Include a date column plus metrics like sessions, users, or pageviews.
          </p>
          <input
            type="file"
            accept=".csv,text/csv"
            disabled={uploading || !canEdit}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-950 disabled:opacity-50"
          />
          {!canEdit && (
            <p className="mt-2 text-xs text-zinc-500">Sign in as admin to upload or delete CSV data.</p>
          )}
        </div>
        {trafficUploads.length > 0 && (
          <>
            <label className="text-sm text-zinc-300">
              Dataset
              <select
                value={activeUpload?.id ?? ""}
                onChange={(e) => setSelectedUploadId(e.target.value)}
                className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
              >
                {trafficUploads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.filename} ({u.uploadedAt.slice(0, 10)})
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Metric
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
              >
                {availableMetrics.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
            {activeUpload && canEdit && (
              <button
                type="button"
                onClick={() => deleteTrafficUpload(activeUpload.id)}
                className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Delete dataset
              </button>
            )}
          </>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {!chartData.length ? (
        <div className="flex h-[480px] items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          Upload a CSV to see your traffic chart with marketing event pins.
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-3 text-xs">
            {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
              <span key={type} className="flex items-center gap-1.5 text-zinc-400">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS] }}
                />
                {label}
              </span>
            ))}
            <span className="text-zinc-500">· {pins.length} events on chart</span>
          </div>
          <div className="h-[520px] w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a1a1aa", fontSize: 11 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: "#fafafa" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name={metric}
                />
                <Scatter
                  data={pins}
                  dataKey="y"
                  name="Marketing events"
                  shape={(props) => {
                    const { cx, cy, payload } = props as {
                      cx?: number;
                      cy?: number;
                      payload?: (typeof pins)[0];
                    };
                    if (cx == null || cy == null || !payload) return null;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={EVENT_TYPE_COLORS[payload.eventType]}
                        stroke="#18181b"
                        strokeWidth={2}
                      />
                    );
                  }}
                >
                  <ZAxis range={[80, 80]} />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const pin = payload[0].payload as (typeof pins)[0];
                      return (
                        <div className="max-w-xs rounded-lg border border-zinc-600 bg-zinc-900 p-3 text-sm shadow-xl">
                          <p className="font-semibold text-zinc-50">{pin.title}</p>
                          <p className="text-zinc-400">{EVENT_TYPE_LABELS[pin.eventType]}</p>
                          <p className="text-zinc-400">{pin.date}</p>
                          {pin.cost != null && (
                            <p className="text-zinc-300">Cost: ${pin.cost.toLocaleString()}</p>
                          )}
                          {pin.collabType && (
                            <p className="text-zinc-300">Type: {pin.collabType}</p>
                          )}
                        </div>
                      );
                    }}
                  />
                </Scatter>
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Events on this chart (hover pins above)
            </h3>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: EVENT_TYPE_COLORS[pin.eventType] }}
                    />
                    <span className="font-medium text-zinc-100">{pin.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    {EVENT_TYPE_LABELS[pin.eventType]} · {pin.date}
                  </p>
                  {pin.cost != null && (
                    <p className="text-xs text-zinc-400">${pin.cost.toLocaleString()}</p>
                  )}
                </div>
              ))}
              {!pins.length && (
                <p className="text-sm text-zinc-500">
                  No marketing events match dates in this CSV range. Add content with matching dates in Content Planner or Collabs.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
