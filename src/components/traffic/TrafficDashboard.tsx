"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/components/providers/AuthProvider";
import { useMarketing } from "@/components/providers/MarketingProvider";
import {
  buildChartPins,
  buildChartTimeline,
  buildTrafficSeries,
} from "@/lib/chartData";
import { parseTrafficCsv, pickDefaultMetric } from "@/lib/csv";
import { addTrafficUpload, deleteTrafficUpload } from "@/lib/firestore";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/types";

export function TrafficDashboard() {
  const { canEdit } = useAuth();
  const { trafficUploads, chartAnnotations } = useMarketing();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [metric, setMetric] = useState<string>("sessions");
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const activeUpload = useMemo(() => {
    if (selectedUploadId) {
      return trafficUploads.find((u) => u.id === selectedUploadId) ?? trafficUploads[0];
    }
    return trafficUploads[0];
  }, [trafficUploads, selectedUploadId]);

  useEffect(() => {
    if (activeUpload?.primaryMetric) {
      setMetric(activeUpload.primaryMetric);
    }
  }, [activeUpload?.id, activeUpload?.primaryMetric]);

  const trafficByDate = useMemo(() => {
    if (!activeUpload) return new Map<string, number>();
    return buildTrafficSeries(activeUpload.rows, metric);
  }, [activeUpload, metric]);

  const chartData = useMemo(() => {
    if (!activeUpload) return [];
    return buildChartTimeline(trafficByDate, chartAnnotations);
  }, [activeUpload, trafficByDate, chartAnnotations]);

  const pins = useMemo(() => {
    if (!chartData.length) return [];
    const dates = chartData.map((d) => d.date);
    return buildChartPins(chartAnnotations, trafficByDate, dates);
  }, [chartAnnotations, trafficByDate, chartData]);

  const availableMetrics = useMemo(() => {
    if (!activeUpload?.rows.length) return [];
    const keys = new Set<string>();
    for (const row of activeUpload.rows) {
      Object.keys(row).forEach((k) => {
        if (k !== "date" && typeof row[k] === "number") keys.add(k);
      });
    }
    return [...keys];
  }, [activeUpload]);

  const hasTrafficValues = useMemo(
    () => chartData.some((d) => d.value != null && d.value > 0),
    [chartData]
  );

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
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
      setSuccess(
        `Uploaded ${rows.length} days · metrics: ${metrics.join(", ")} · charting "${primaryMetric}"`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse CSV");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="min-w-[200px] flex-1">
          <label className="block text-sm font-medium text-zinc-300">Upload traffic CSV</label>
          <p className="mb-2 text-xs text-zinc-500">
            Needs a <strong>date</strong> column plus numeric columns (Sessions, Users, Pageviews,
            Active users, etc.). Supports Google Analytics exports and{" "}
            <code className="text-zinc-400">YYYY-MM-DD</code> / <code className="text-zinc-400">MM/DD/YYYY</code>.
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
                    {u.filename} ({u.rows.length} rows)
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-zinc-300">
              Metric
              <select
                value={availableMetrics.includes(metric) ? metric : availableMetrics[0] ?? metric}
                onChange={(e) => setMetric(e.target.value)}
                className="mt-1 block rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2"
              >
                {availableMetrics.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
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
      {success && <p className="mb-4 text-sm text-emerald-400">{success}</p>}

      {canEdit && (
        <p className="mb-4 text-sm text-zinc-400">
          Add marketing events on any date in{" "}
          <Link href="/content" className="text-amber-400 hover:underline">
            Content Planner
          </Link>
          ,{" "}
          <Link href="/collabs" className="text-amber-400 hover:underline">
            Collabs
          </Link>
          , or{" "}
          <Link href="/calendar" className="text-amber-400 hover:underline">
            Calendar
          </Link>
          . Past and future dates all appear as pins on this chart.
        </p>
      )}

      {!activeUpload ? (
        <div className="flex h-[480px] items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          Upload a CSV to see your traffic chart with marketing event pins.
        </div>
      ) : !hasTrafficValues ? (
        <div className="flex h-[480px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500">
          <p>Dataset loaded ({activeUpload.rows.length} rows) but no values for this metric.</p>
          <p className="text-sm">Try another metric in the dropdown above.</p>
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
            <span className="text-zinc-500">
              · {pins.length} event{pins.length !== 1 ? "s" : ""} on chart ·{" "}
              {chartData.filter((d) => d.value != null).length} days with traffic data
            </span>
          </div>
          <div className="h-[520px] w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                  interval="preserveStartEnd"
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
                  dot={{ r: 2, fill: "#f59e0b" }}
                  connectNulls={false}
                  name={metric}
                />
                {pins.map((pin) => (
                  <ReferenceDot
                    key={pin.id}
                    x={pin.date}
                    y={pin.y}
                    r={pin.onTrafficDay ? 8 : 6}
                    fill={EVENT_TYPE_COLORS[pin.eventType]}
                    stroke="#18181b"
                    strokeWidth={2}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Marketing events on chart (hover pins)
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
                    {!pin.onTrafficDay && " · event only (no CSV row)"}
                  </p>
                  {pin.cost != null && (
                    <p className="text-xs text-zinc-400">${pin.cost.toLocaleString()}</p>
                  )}
                </div>
              ))}
              {!pins.length && (
                <p className="text-sm text-zinc-500">
                  No events yet. Admins: add items in Content Planner or Collabs with a scheduled
                  date — they will show here automatically.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
