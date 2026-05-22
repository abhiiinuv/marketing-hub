/**
 * Ensures user-entered links open externally instead of as paths on this site.
 * e.g. "youtube.com/@channel" -> "https://youtube.com/@channel"
 */
export function normalizeExternalUrl(url: string | undefined | null): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}
