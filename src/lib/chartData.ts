import { compareChartDates, normalizeChartDate } from "./dates";
import type { ChartAnnotation, TrafficRow } from "./types";

export type ChartPoint = {
  date: string;
  value: number | null;
};

export function buildTrafficSeries(
  rows: TrafficRow[],
  metric: string
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const v =
      (row[metric] as number) ??
      row.sessions ??
      row.users ??
      row.pageviews ??
      undefined;
    if (v !== undefined && Number.isFinite(v)) {
      map.set(row.date, v);
    }
  }
  return map;
}

/** Merge CSV dates + all event dates so past/future events appear on the chart. */
export function buildChartTimeline(
  trafficByDate: Map<string, number>,
  annotations: ChartAnnotation[]
): ChartPoint[] {
  const dates = new Set<string>(trafficByDate.keys());
  for (const a of annotations) {
    const d = normalizeChartDate(a.date) ?? a.date.slice(0, 10);
    if (d) dates.add(d);
  }

  return [...dates]
    .sort(compareChartDates)
    .map((date) => ({
      date,
      value: trafficByDate.has(date) ? trafficByDate.get(date)! : null,
    }));
}

export function buildChartPins(
  annotations: ChartAnnotation[],
  trafficByDate: Map<string, number>,
  chartDates: string[]
): (ChartAnnotation & { date: string; y: number; onTrafficDay: boolean })[] {
  const minTraffic = Math.min(
    ...[...trafficByDate.values()].filter((v) => v > 0),
    0
  );
  const fallbackY = minTraffic > 0 ? minTraffic * 0.05 : 1;

  return annotations
    .map((a) => {
      const date = normalizeChartDate(a.date) ?? a.date.slice(0, 10);
      const traffic = trafficByDate.get(date);
      const onTrafficDay = traffic !== undefined;
      const y = onTrafficDay ? traffic! : fallbackY;
      return { ...a, date, y, onTrafficDay };
    })
    .filter((p) => chartDates.includes(p.date));
}
