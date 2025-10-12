export type OperatingHourEntry = {
  day: string;
  open: string;
  close: string;
};

export const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_OPERATING_HOURS: OperatingHourEntry[] = [
  { day: 'Monday', open: '09:00', close: '17:00' },
  { day: 'Tuesday', open: '09:00', close: '17:00' },
  { day: 'Wednesday', open: '09:00', close: '17:00' },
  { day: 'Thursday', open: '09:00', close: '17:00' },
  { day: 'Friday', open: '09:00', close: '17:00' },
];

const TIME_REGEX = /^([0-2]?\d):([0-5]\d)$/;

const DAY_ALIASES = DAY_NAMES.reduce<Record<string, string>>((acc, day) => {
  const base = day.toLowerCase();
  const trimmed = base.replace(/\s+/g, '');
  const keyWithoutSuffix = trimmed.replace(/day$/u, '');
  acc[base] = day;
  acc[trimmed] = day;
  acc[keyWithoutSuffix] = day;
  acc[keyWithoutSuffix.slice(0, 3)] = day;
  acc[base.slice(0, 3)] = day;
  return acc;
}, {});

function normalizeTimeString(value: string | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const match = TIME_REGEX.exec(trimmed);
  if (!match) return null;
  const hours = match[1];
  const minutes = match[2];
  const numericHours = Number(hours);
  if (Number.isNaN(numericHours) || numericHours > 23) {
    return null;
  }
  const normalizedHours = hours.padStart(2, '0');
  return `${normalizedHours}:${minutes}`;
}

function canonicalizeDay(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const key = input.trim().toLowerCase().replace(/\./g, '');
  return DAY_ALIASES[key] ?? null;
}

function extractTimes(value: unknown): { open: string; close: string } | null {
  if (!value) return null;

  if (typeof value === 'string') {
    const matches = value.match(/\d{1,2}:[0-5]\d/g);
    if (matches && matches.length > 0) {
      const open = normalizeTimeString(matches[0]);
      const close = normalizeTimeString(matches[1] ?? matches[0]);
      if (open && close) return { open, close };
    }

    const parts = value
      .split(/-|–|—|to|until/gi)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    if (parts.length > 0) {
      const open = normalizeTimeString(parts[0]);
      const close = normalizeTimeString(parts[1] ?? parts[0]);
      if (open && close) return { open, close };
    }
    return null;
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const openCandidate =
      normalizeTimeString(record['open'] as string) ??
      normalizeTimeString(record['start'] as string);
    const closeCandidate =
      normalizeTimeString(record['close'] as string) ??
      normalizeTimeString(record['end'] as string);

    if (openCandidate && closeCandidate) {
      return { open: openCandidate, close: closeCandidate };
    }

    const rangeCandidate = record['range'];
    if (typeof rangeCandidate === 'string') {
      return extractTimes(rangeCandidate);
    }

    const hoursCandidate = record['hours'];
    if (typeof hoursCandidate === 'string') {
      return extractTimes(hoursCandidate);
    }
  }

  return null;
}

function collectOperatingHours(raw: unknown): OperatingHourEntry[] {
  const collected: OperatingHourEntry[] = [];

  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const base = item as Record<string, unknown>;
      const day = canonicalizeDay(base['day'] as string);
      if (!day) return;
      const times = extractTimes(base);
      if (!times) return;
      collected.push({ day, ...times });
    });
    return collected;
  }

  if (raw && typeof raw === 'object') {
    Object.entries(raw as Record<string, unknown>).forEach(([dayKey, value]) => {
      const day = canonicalizeDay(dayKey);
      if (!day) return;
      const times = extractTimes(value);
      if (!times) return;
      collected.push({ day, ...times });
    });
  }

  return collected;
}

export function coerceOperatingHoursArray(raw: unknown): OperatingHourEntry[] {
  const collected = collectOperatingHours(raw);
  if (collected.length === 0) {
    return [];
  }

  const byDay = new Map<string, OperatingHourEntry>();
  collected.forEach((entry) => {
    byDay.set(entry.day, entry);
  });

  const ordered = DAY_NAMES.map((day) => byDay.get(day)).filter(
    (entry): entry is OperatingHourEntry => Boolean(entry),
  );

  if (ordered.length > 0) {
    return ordered;
  }

  return Array.from(byDay.values());
}

export function normalizeOperatingHours(raw: unknown): OperatingHourEntry[] {
  const entries = coerceOperatingHoursArray(raw);
  return entries.length > 0 ? entries : DEFAULT_OPERATING_HOURS;
}
