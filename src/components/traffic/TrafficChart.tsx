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
import { EventLegend } from "./EventLegend";
import type { ChartPointWithEvents } from "@/lib/chartData";

type TrafficChartProps = {
  height?: number;
  showControls?: boolean;
  showLegend?: boolean;
  emptyMessage?: string;
};

export function TrafficChart({
  height = 520,
  showControls = true,
  showLegend = true,
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
        className="panel-subtle flex items-center justify-center text-[var(--text-muted)]"
        style={{ height }}
      >
        <p className="max-w-md px-4 text-center text-sm">
          {emptyMessage}{" "}
          <Link href="/traffic" className="link-teal hover:underline">
            Data Upload →
          </Link>
        </p>
      </div>
    );
  }

  if (!hasTrafficValues) {
    return (
      <div
        className="panel-subtle flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]"
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
        <div className="mb-4 flex flex-wrap items-center gap-4">
          {trafficUploads.length > 1 && (
            <label className="text-sm text-[var(--text-muted)]">
              Dataset
              <select
                value={activeUpload.id}
                onChange={(e) => setSelectedUploadId(e.target.value)}
                className="input-field ml-2 !mt-0 inline-block w-auto py-1.5"
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
            <label className="text-sm text-[var(--text-muted)]">
              Metric
              <select
                value={availableMetrics.includes(metric) ? metric : availableMetrics[0]}
                onChange={(e) => setMetric(e.target.value)}
                className="input-field ml-2 !mt-0 inline-block w-auto py-1.5"
              >
                {availableMetrics.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
          )}
          <span className="text-xs text-[var(--text-subtle)]">
            Hover for preview · Click for full details
          </span>
        </div>
      )}

      {showLegend && <EventLegend />}

      <div className="panel overflow-hidden p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: CHART_TOP_MARGIN, right: 24, left: 8, bottom: 56 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#737373", fontSize: 10 }}
              angle={-35}
              textAnchor="end"
              height={56}
              interval="preserveStartEnd"
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <YAxis
              tick={{ fill: "#737373", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={{ stroke: "var(--border)" }}
            />
            <Tooltip
              content={<DayChartTooltip metricLabel={metricLabel} />}
              cursor={{ stroke: "var(--traycer-teal-muted)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-line)"
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
