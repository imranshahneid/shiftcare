import { DAYS_OF_WEEK, DayOfWeek } from './types';

const TIME_PATTERN = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

export type ParsedTime = { hours: number; minutes: number };

export const parseTimeString = (raw: string): ParsedTime => {
  if (typeof raw !== 'string') {
    throw new Error(`Invalid time: expected string, got ${typeof raw}`);
  }
  const trimmed = raw.trim().replace(/\s+/g, '').toUpperCase();
  const match = TIME_PATTERN.exec(trimmed);
  if (!match) {
    throw new Error(`Invalid time format: "${raw}"`);
  }
  const hour12 = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];
  if (hour12 < 1 || hour12 > 12) {
    throw new Error(`Invalid hour: ${hour12}`);
  }
  if (minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}`);
  }
  let hours: number;
  if (meridiem === 'AM') {
    hours = hour12 === 12 ? 0 : hour12;
  } else {
    hours = hour12 === 12 ? 12 : hour12 + 12;
  }
  return { hours, minutes };
};

export const minutesSinceMidnight = (raw: string): number => {
  const { hours, minutes } = parseTimeString(raw);
  return hours * 60 + minutes;
};

export const formatMinutes = (totalMinutes: number): string => {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const meridiem = h24 < 12 ? 'AM' : 'PM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const mm = m.toString().padStart(2, '0');
  return `${h12}:${mm} ${meridiem}`;
};

export const isValidDayOfWeek = (value: unknown): value is DayOfWeek =>
  typeof value === 'string' && (DAYS_OF_WEEK as readonly string[]).includes(value);

export const dayOfWeekIndex = (day: DayOfWeek): number => DAYS_OF_WEEK.indexOf(day);
