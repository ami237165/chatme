export function nowTimestampSeconds(): string {
  return String(Math.floor(Date.now() / 1000));
}

export function timestampSecondsAgo(seconds: number): string {
  return String(Math.floor(Date.now() / 1000) - seconds);
}

export function toTimestampSecondsString(
  value: string | number | Date | undefined | null,
): string {
  if (value === undefined || value === null || value === '') {
    return nowTimestampSeconds();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) {
      if (trimmed.length >= 13) {
        return String(Math.floor(Number(trimmed) / 1000));
      }
      return String(Math.floor(Number(trimmed)));
    }

    const parsed = Date.parse(trimmed);
    if (!Number.isNaN(parsed)) {
      return String(Math.floor(parsed / 1000));
    }

    return nowTimestampSeconds();
  }

  if (typeof value === 'number') {
    if (value > 1e12) {
      return String(Math.floor(value / 1000));
    }
    return String(Math.floor(value));
  }

  return String(Math.floor(value.getTime() / 1000));
}

export function timestampToDate(value: string | number): Date {
  const seconds = Number(toTimestampSecondsString(value));
  return new Date(seconds * 1000);
}
