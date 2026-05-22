import Papa from "papaparse";
import type { TrafficRow } from "./types";

const DATE_KEYS = ["date", "day", "period", "timestamp"];
const METRIC_KEYS = ["sessions", "users", "pageviews", "views", "visits", "traffic"];

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseNumber(value: string): number | undefined {
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function findDateKey(headers: string[]): string | null {
  for (const h of headers) {
    const n = normalizeKey(h);
    if (DATE_KEYS.some((d) => n.includes(d))) return h;
  }
  return headers[0] ?? null;
}

function findMetricKeys(headers: string[], dateKey: string): string[] {
  return headers.filter((h) => {
    if (h === dateKey) return false;
    const n = normalizeKey(h);
    return METRIC_KEYS.some((m) => n.includes(m)) || !Number.isNaN(Number("0"));
  });
}

export function parseTrafficCsv(text: string): {
  rows: TrafficRow[];
  metrics: string[];
  dateKey: string;
} {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (!parsed.data.length) {
    throw new Error("CSV is empty or could not be parsed.");
  }

  const headers = Object.keys(parsed.data[0]);
  const dateKey = findDateKey(headers);
  if (!dateKey) throw new Error("Could not find a date column in the CSV.");

  const metricHeaders = findMetricKeys(headers, dateKey);
  const rows: TrafficRow[] = [];

  for (const row of parsed.data) {
    const rawDate = row[dateKey]?.trim();
    if (!rawDate) continue;

    const entry: TrafficRow = { date: rawDate };
    for (const key of metricHeaders) {
      const val = row[key];
      if (val === undefined || val === "") continue;
      const num = parseNumber(val);
      const normalized = normalizeKey(key);
      if (num !== undefined) {
        entry[normalized] = num;
        if (normalized.includes("session")) entry.sessions = num;
        if (normalized.includes("user")) entry.users = num;
        if (normalized.includes("pageview") || normalized.includes("view"))
          entry.pageviews = num;
      }
    }
    rows.push(entry);
  }

  rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const metrics = [
    ...new Set(
      rows.flatMap((r) =>
        Object.keys(r).filter((k) => k !== "date" && typeof r[k] === "number")
      )
    ),
  ];

  return { rows, metrics, dateKey };
}

export function pickDefaultMetric(metrics: string[]): string {
  const priority = ["sessions", "users", "pageviews", "views", "visits"];
  for (const p of priority) {
    const found = metrics.find((m) => m.includes(p));
    if (found) return found;
  }
  return metrics[0] ?? "sessions";
}
