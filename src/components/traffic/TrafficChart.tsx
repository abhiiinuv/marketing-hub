"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTrafficChartData } from "@/hooks/useTrafficChartData";
import { DayChartTooltip } from "./DayChartTooltip";
import { DayDetailModal } from "./DayDetailModal";
import { ChartDayDot, CHART_TOP_MARGIN } from "./ChartDayDot";
import type { ChartPointWithEvents } from "@/lib/chartData";

type TrafficChartProps = {
  height?: number;
  showControls?: boolean;
  emptyMessage?: string;
};

export function TrafficChart({
  height = 480,
  showControls = true,
  emptyMessage = "Upload a CSV in Data Upload to see traffic here.",
}: TrafficChartProps) {
  const {
    trafficUploads,
    activeUpload,
    chartData,
    hasTrafficValues,
    metric,
    setMetric,
    metricLabel,
    setSelectedUploadId,
    availableMetrics,
  } = useTrafficChartData();

  const [selectedPoint, setSelectedPoint] = useState<ChartPointWithEvents | null>(null);

  const openDayDetail = useCallback((point: ChartPointWithEvents) => {
    setSelectedPoint(point);
  }, []);

  const renderDot = useCallback(
    (props: { cx?: number; cy?: number; payload?: ChartPointWithEvents }) => (
      <ChartDayDot {...props} onSelect={openDayDetail} />
    ),
    [openDayDetail]
  );

  const renderActiveDot = useCallback(
    (props: { cx?: number; cy?: number; payload?: ChartPointWithEvents }) => (
      <ChartDayDot {...props} active onSelect={openDayDetail} />
    ),
    [openDayDetail]
  );

  if (!activeUpload) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-700 text-zinc-500"
        style={{ height }}
      >
        <p className="max-w-md px-4 text-center text-sm">
          {emptyMessage}{" "}
          <Link href="/traffic" className="text-amber-400 hover:underline">
            Data Upload →
          </Link>
        </p>
      </div>
    );
  }

  if (!hasTrafficValues) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 text-zinc-500"
        style={{ height }}
      >
        <p>Dataset loaded ({activeUpload.rows.length} rows) but no values for this metric.</p>
        {showControls && availableMetrics.length > 1 && (
          <p className="text-sm">Try another metric below.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {showControls && trafficUploads.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {trafficUploads.length > 1 && (
            <label className="text-sm text-zinc-400">
              Dataset
              <select
                value={activeUpload.id}
                onChange={(e) => setSelectedUploadId(e.target.value)}
                className="ml-2 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200"
              >
                {trafficUploads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.filename}
                  </option>
                ))}
              </select>
            </label>
          )}
          {availableMetrics.length > 1 && (
            <label className="text-sm text-zinc-400">
              Metric
              <select
                value={availableMetrics.includes(metric) ? metric : availableMetrics[0]}
                onChange={(e) => setMetric(e.target.value)}
                className="ml-1 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-200"
              >
                {availableMetrics.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span className="text-xs text-zinc-500">
            Amber = sessions · Colored dots above = marketing events · Hover or click for details
          </span>
        </div>
      )}

      <div
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-2"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: CHART_TOP_MARGIN, right: 24, left: 8, bottom: 56 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={56}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <Tooltip
              content={<DayChartTooltip metricLabel={metricLabel} />}
              cursor={{ stroke: "#52525b", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f59e0b"
              strokeWidth={2}
              connectNulls={false}
              dot={renderDot}
              activeDot={renderActiveDot}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <DayDetailModal
        point={selectedPoint}
        metricLabel={metricLabel}
        onClose={() => setSelectedPoint(null)}
      />
    </div>
  );
}
