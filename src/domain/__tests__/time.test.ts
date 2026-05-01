import {
  parseTimeString,
  minutesSinceMidnight,
  formatMinutes,
  isValidDayOfWeek,
  dayOfWeekIndex,
} from '../time';

describe('parseTimeString', () => {
  it('parses standard 12-hour AM times', () => {
    expect(parseTimeString('9:00AM')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTimeString('11:30AM')).toEqual({ hours: 11, minutes: 30 });
  });

  it('parses standard 12-hour PM times', () => {
    expect(parseTimeString('1:00PM')).toEqual({ hours: 13, minutes: 0 });
    expect(parseTimeString('5:30PM')).toEqual({ hours: 17, minutes: 30 });
  });

  it('handles midnight (12:00AM) and noon (12:00PM)', () => {
    expect(parseTimeString('12:00AM')).toEqual({ hours: 0, minutes: 0 });
    expect(parseTimeString('12:00PM')).toEqual({ hours: 12, minutes: 0 });
  });

  it('handles leading whitespace from API payload', () => {
    expect(parseTimeString(' 9:00AM')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTimeString('  5:30PM ')).toEqual({ hours: 17, minutes: 30 });
  });

  it('handles space between time and meridiem', () => {
    expect(parseTimeString('9:00 AM')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTimeString('5:30 PM')).toEqual({ hours: 17, minutes: 30 });
  });

  it('is case-insensitive on meridiem', () => {
    expect(parseTimeString('9:00am')).toEqual({ hours: 9, minutes: 0 });
    expect(parseTimeString('5:30pm')).toEqual({ hours: 17, minutes: 30 });
  });

  it('rejects malformed strings', () => {
    expect(() => parseTimeString('25:00AM')).toThrow();
    expect(() => parseTimeString('9:60PM')).toThrow();
    expect(() => parseTimeString('not-a-time')).toThrow();
    expect(() => parseTimeString('')).toThrow();
    expect(() => parseTimeString('9:00')).toThrow();
  });

  it('rejects non-string input', () => {
    expect(() => parseTimeString(null as unknown as string)).toThrow();
    expect(() => parseTimeString(undefined as unknown as string)).toThrow();
    expect(() => parseTimeString(900 as unknown as string)).toThrow();
  });
});

describe('minutesSinceMidnight', () => {
  it('converts time strings to minutes', () => {
    expect(minutesSinceMidnight('12:00AM')).toBe(0);
    expect(minutesSinceMidnight('9:00AM')).toBe(540);
    expect(minutesSinceMidnight(' 5:30PM')).toBe(17 * 60 + 30);
    expect(minutesSinceMidnight('11:59PM')).toBe(23 * 60 + 59);
  });
});

describe('formatMinutes', () => {
  it('formats minutes back to 12-hour with meridiem', () => {
    expect(formatMinutes(0)).toBe('12:00 AM');
    expect(formatMinutes(540)).toBe('9:00 AM');
    expect(formatMinutes(720)).toBe('12:00 PM');
    expect(formatMinutes(17 * 60 + 30)).toBe('5:30 PM');
    expect(formatMinutes(23 * 60 + 45)).toBe('11:45 PM');
  });
});

describe('isValidDayOfWeek', () => {
  it('accepts valid day names', () => {
    expect(isValidDayOfWeek('Monday')).toBe(true);
    expect(isValidDayOfWeek('Sunday')).toBe(true);
  });

  it('rejects invalid input', () => {
    expect(isValidDayOfWeek('monday')).toBe(false);
    expect(isValidDayOfWeek('Mon')).toBe(false);
    expect(isValidDayOfWeek(null)).toBe(false);
    expect(isValidDayOfWeek(undefined)).toBe(false);
    expect(isValidDayOfWeek(0)).toBe(false);
  });
});

describe('dayOfWeekIndex', () => {
  it('matches JS Date.getUTCDay convention (Sunday=0)', () => {
    expect(dayOfWeekIndex('Sunday')).toBe(0);
    expect(dayOfWeekIndex('Monday')).toBe(1);
    expect(dayOfWeekIndex('Saturday')).toBe(6);
  });
});
