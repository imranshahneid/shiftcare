import { Doctor, ScheduleRow, ScheduleWindow } from './types';
import { isValidDayOfWeek, minutesSinceMidnight } from './time';

export const slugifyDoctorId = (name: string): string =>
  name
    .normalize('NFKD')
    .replace(/[^\w\s.-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const safeParseRow = (row: unknown): ScheduleRow | null => {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.name !== 'string' || r.name.trim() === '') return null;
  if (typeof r.timezone !== 'string' || r.timezone.trim() === '') return null;
  if (!isValidDayOfWeek(r.day_of_week)) return null;
  if (typeof r.available_at !== 'string' || typeof r.available_until !== 'string') return null;
  return {
    name: r.name.trim(),
    timezone: r.timezone.trim(),
    day_of_week: r.day_of_week,
    available_at: r.available_at,
    available_until: r.available_until,
  };
};

const buildWindow = (row: ScheduleRow): ScheduleWindow | null => {
  try {
    const startMinutes = minutesSinceMidnight(row.available_at);
    const endMinutes = minutesSinceMidnight(row.available_until);
    if (endMinutes <= startMinutes) return null;
    return { dayOfWeek: row.day_of_week, startMinutes, endMinutes };
  } catch {
    return null;
  }
};

export const groupDoctors = (rows: unknown): Doctor[] => {
  if (!Array.isArray(rows)) return [];

  const map = new Map<string, Doctor>();

  for (const raw of rows) {
    const row = safeParseRow(raw);
    if (!row) continue;
    const window = buildWindow(row);
    if (!window) continue;

    const id = slugifyDoctorId(row.name);
    const existing = map.get(id);
    if (existing) {
      if (existing.timezone !== row.timezone) {
        // Conflicting timezones for the same doctor name — skip the conflicting row.
        continue;
      }
      existing.windows.push(window);
    } else {
      map.set(id, {
        id,
        name: row.name,
        timezone: row.timezone,
        windows: [window],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
};
