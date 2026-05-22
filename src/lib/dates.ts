/** Normalize assorted CSV / form dates to YYYY-MM-DD for charts and matching. */
export function normalizeChartDate(raw: string): string | null {
  const s = raw.trim().replace(/^"|"$/g, "");
  if (!s) return null;

  // Google Analytics: 20250115
  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    const iso = `${y}-${m}-${d}`;
    return isValidIso(iso) ? iso : null;
  }

  // Already ISO date or datetime
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }

  // DD/MM/YYYY or MM/DD/YYYY (prefer day-first if ambiguous when first part > 12)
  const slash = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  if (slash) {
    const a = parseInt(slash[1], 10);
    const b = parseInt(slash[2], 10);
    let y = parseInt(slash[3], 10);
    if (y < 100) y += 2000;
    let month: number;
    let day: number;
    if (a > 12) {
      day = a;
      month = b;
    } else if (b > 12) {
      month = a;
      day = b;
    } else {
      month = a;
      day = b;
    }
    const iso = `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return isValidIso(iso) ? iso : null;
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function isValidIso(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function compareChartDates(a: string, b: string): number {
  return a.localeCompare(b);
}
