export type DayOfWeek =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export const DAYS_OF_WEEK: readonly DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type ScheduleRow = {
  name: string;
  timezone: string;
  day_of_week: DayOfWeek;
  available_at: string;
  available_until: string;
};

export type ScheduleWindow = {
  dayOfWeek: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
};

export type Doctor = {
  id: string;
  name: string;
  timezone: string;
  windows: ScheduleWindow[];
};

export type Slot = {
  doctorId: string;
  doctorName: string;
  timezone: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startISO: string;
  endISO: string;
  label: string;
};

export type Booking = {
  id: string;
  doctorId: string;
  doctorName: string;
  timezone: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startISO: string;
  endISO: string;
  label: string;
  createdAtISO: string;
};

export const bookingKey = (doctorId: string, startISO: string): string =>
  `${doctorId}|${startISO}`;
