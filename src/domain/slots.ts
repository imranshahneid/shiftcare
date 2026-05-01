import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { Doctor, DayOfWeek, DAYS_OF_WEEK, Slot } from './types';
import { formatMinutes } from './time';

export const SLOT_MINUTES = 30;
export const WEEK_LENGTH = 7;

const pad2 = (n: number): string => n.toString().padStart(2, '0');

const dayOfWeekFromUtcMillis = (utcMillis: number): DayOfWeek => {
  const idx = new Date(utcMillis).getUTCDay();
  return DAYS_OF_WEEK[idx];
};

export type GenerateSlotsOptions = {
  now?: Date;
  daysAhead?: number;
};

const todayInTimeZoneAsYMD = (now: Date, timezone: string): [number, number, number] => {
  const ymd = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const [y, m, d] = ymd.split('-').map(Number);
  return [y, m, d];
};

export const generateSlotsForDoctor = (
  doctor: Doctor,
  options: GenerateSlotsOptions = {},
): Slot[] => {
  const now = options.now ?? new Date();
  const daysAhead = options.daysAhead ?? WEEK_LENGTH;

  const [year, month, day] = todayInTimeZoneAsYMD(now, doctor.timezone);
  const baseUtcMillis = Date.UTC(year, month - 1, day);

  const slots: Slot[] = [];

  for (let offset = 0; offset < daysAhead; offset++) {
    const dayUtcMillis = baseUtcMillis + offset * 86_400_000;
    const dayOfWeek = dayOfWeekFromUtcMillis(dayUtcMillis);

    const dayUtc = new Date(dayUtcMillis);
    const dateStr = `${dayUtc.getUTCFullYear()}-${pad2(dayUtc.getUTCMonth() + 1)}-${pad2(dayUtc.getUTCDate())}`;

    const matchingWindows = doctor.windows.filter((w) => w.dayOfWeek === dayOfWeek);
    if (matchingWindows.length === 0) continue;

    for (const window of matchingWindows) {
      for (
        let minutes = window.startMinutes;
        minutes + SLOT_MINUTES <= window.endMinutes;
        minutes += SLOT_MINUTES
      ) {
        const startHH = pad2(Math.floor(minutes / 60));
        const startMM = pad2(minutes % 60);
        const endTotalMinutes = minutes + SLOT_MINUTES;
        const endHH = pad2(Math.floor(endTotalMinutes / 60));
        const endMM = pad2(endTotalMinutes % 60);

        const startWallClock = `${dateStr} ${startHH}:${startMM}:00`;
        const endWallClock = `${dateStr} ${endHH}:${endMM}:00`;

        const startUtc = fromZonedTime(startWallClock, doctor.timezone);
        const endUtc = fromZonedTime(endWallClock, doctor.timezone);

        if (Number.isNaN(startUtc.getTime()) || Number.isNaN(endUtc.getTime())) continue;

        slots.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          timezone: doctor.timezone,
          dayOfWeek,
          date: dateStr,
          startISO: startUtc.toISOString(),
          endISO: endUtc.toISOString(),
          label: `${formatMinutes(minutes)} – ${formatMinutes(endTotalMinutes)}`,
        });
      }
    }
  }

  slots.sort((a, b) => a.startISO.localeCompare(b.startISO));
  return slots;
};

export const groupSlotsByDate = (slots: Slot[]): { date: string; dayOfWeek: DayOfWeek; slots: Slot[] }[] => {
  const map = new Map<string, { date: string; dayOfWeek: DayOfWeek; slots: Slot[] }>();
  for (const slot of slots) {
    const existing = map.get(slot.date);
    if (existing) {
      existing.slots.push(slot);
    } else {
      map.set(slot.date, { date: slot.date, dayOfWeek: slot.dayOfWeek, slots: [slot] });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};
