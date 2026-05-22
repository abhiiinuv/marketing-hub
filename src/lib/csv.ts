import Papa from "papaparse";
import { normalizeChartDate } from "./dates";
import type { TrafficRow } from "./types";

const DATE_KEYS = ["date", "day", "period", "timestamp", "week", "month"];

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^\w]/g, "_");
}

function parseNumber(value: string): number | undefined {
  const cleaned = value
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/\$/g, "")
    .trim();
  if (!cleaned || cleaned === "-" || cleaned === "N/A") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function applyMetricAliases(entry: TrafficRow, normalized: string, num: number) {
  entry[normalized] = num;
  if (normalized.includes("session")) entry.sessions = num;
  if (normalized.includes("user")) entry.users = num;
  if (
    normalized.includes("pageview") ||
    normalized === "views" ||
    normalized.includes("view")
  )
    entry.pageviews = num;
  if (normalized.includes("visit")) entry.sessions = entry.sessions ?? num;
}

function findDateKey(headers: string[]): string | null {
  for (const h of headers) {
    const n = normalizeKey(h);
    if (DATE_KEYS.some((d) => n.includes(d))) return h;
  }
  return null;
}

function columnLooksNumeric(
  rows: Record<string, string>[],
  key: string,
  sample = 8
): boolean {
  let numeric = 0;
  let checked = 0;
  for (const row of rows) {
    const val = row[key]?.trim();
    if (!val) continue;
    checked++;
    if (parseNumber(val) !== undefined) numeric++;
    if (checked >= sample) break;
  }
  return checked > 0 && numeric / checked >= 0.5;
}

function findMetricKeys(
  headers: string[],
  dateKey: string,
  rows: Record<string, string>[]
): string[] {
  return headers.filter((h) => {
    if (h === dateKey) return false;
    const n = normalizeKey(h);
    if (DATE_KEYS.some((d) => n.includes(d))) return false;
    return columnLooksNumeric(rows, h);
  });
}

/** Dates as column headers (e.g. Mixpanel/Amplitude: series, name, 21-Feb-2026, 22-Feb-2026, …) */
function isWideDateHeaderFormat(headers: string[]): boolean {
  const dateCols = headers.filter((h) => normalizeChartDate(h) !== null);
  const labelCols = headers.length - dateCols.length;
  return dateCols.length >= 3 && dateCols.length > labelCols;
}

function parseWideFormat(
  data: Record<string, string>[],
  headers: string[]
): { rows: TrafficRow[]; metrics: string[]; dateKey: string } {
  const dateHeaders = headers.filter((h) => normalizeChartDate(h) !== null);
  const labelKeys = headers.filter((h) => normalizeChartDate(h) === null);

  const rows: TrafficRow[] = [];

  for (const dateHeader of dateHeaders) {
    const isoDate = normalizeChartDate(dateHeader)!;
    const entry: TrafficRow = { date: isoDate };

    for (const row of data) {
      const labels = labelKeys
        .map((k) => row[k]?.trim())
        .filter((v) => v && v.length > 0);
      const metricKey = normalizeKey(
        labels.join("_").replace(/^\$/, "") || "value"
      );
      const num = parseNumber(row[dateHeader] ?? "");
      if (num !== undefined) {
        applyMetricAliases(entry, metricKey, num);
      }
    }

    if (Object.keys(entry).length > 1) rows.push(entry);
  }

  if (!rows.length) {
    throw new Error("Wide-format CSV had no numeric values under date columns.");
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const metrics = [
    ...new Set(
      rows.flatMap((r) =>
        Object.keys(r).filter((k) => k !== "date" && typeof r[k] === "number")
      )
    ),
  ];

  return { rows, metrics, dateKey: "date (columns)" };
}

function parseLongFormat(
  data: Record<string, string>[],
  headers: string[]
): { rows: TrafficRow[]; metrics: string[]; dateKey: string } {
  const dateKey = findDateKey(headers);
  if (!dateKey) throw new Error("Could not find a date column in the CSV.");

  const metricHeaders = findMetricKeys(headers, dateKey, data);
  if (!metricHeaders.length) {
    throw new Error(
      "No numeric metric columns found. Add columns like Sessions, Users, or Pageviews."
    );
  }

  const rows: TrafficRow[] = [];

  for (const row of data) {
    const rawDate = row[dateKey]?.trim();
    if (!rawDate) continue;

    const isoDate = normalizeChartDate(rawDate);
    if (!isoDate) continue;

    const entry: TrafficRow = { date: isoDate };
    for (const key of metricHeaders) {
      const val = row[key];
      if (val === undefined || val === "") continue;
      const num = parseNumber(val);
      const normalized = normalizeKey(key);
      if (num !== undefined) {
        applyMetricAliases(entry, normalized, num);
      }
    }

    if (Object.keys(entry).length > 1) rows.push(entry);
  }

  if (!rows.length) {
    throw new Error(
      "No valid rows after parsing. Check date format (YYYY-MM-DD, 21-Feb-2026, or GA 20250115)."
    );
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));

  const metrics = [
    ...new Set(
      rows.flatMap((r) =>
        Object.keys(r).filter((k) => k !== "date" && typeof r[k] === "number")
      )
    ),
  ];

  return { rows, metrics, dateKey };
}

export function parseTrafficCsv(text: string): {
  rows: TrafficRow[];
  metrics: string[];
  dateKey: string;
} {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().replace(/^\uFEFF/, ""),
    delimitersToGuess: [",", "\t", ";"],
  });

  if (parsed.errors.length && !parsed.data.length) {
    throw new Error(parsed.errors[0]?.message ?? "Could not parse CSV.");
  }

  if (!parsed.data.length) {
    throw new Error("CSV is empty or has no data rows.");
  }

  const headers = Object.keys(parsed.data[0]).filter(Boolean);
  if (!headers.length) {
    throw new Error("CSV has no column headers.");
  }

  if (isWideDateHeaderFormat(headers)) {
    return parseWideFormat(parsed.data, headers);
  }

  return parseLongFormat(parsed.data, headers);
}

export function pickDefaultMetric(metrics: string[]): string {
  const priority = [
    "unique_sessions",
    "sessions",
    "users",
    "pageviews",
    "pageview",
    "active_users",
    "views",
    "visits",
    "traffic",
  ];
  for (const p of priority) {
    const found = metrics.find((m) => m.includes(p) || m === p);
    if (found) return found;
  }
  return metrics[0] ?? "sessions";
}
