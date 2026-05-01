import { generateSlotsForDoctor, groupSlotsByDate, SLOT_MINUTES } from '../slots';
import { Doctor } from '../types';

const sydneyDoctor: Doctor = {
  id: 'sydney-doc',
  name: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  windows: [
    { dayOfWeek: 'Monday', startMinutes: 9 * 60, endMinutes: 17 * 60 + 30 },
    { dayOfWeek: 'Tuesday', startMinutes: 8 * 60, endMinutes: 16 * 60 },
  ],
};

const perthMultiWindow: Doctor = {
  id: 'perth-doc',
  name: 'Perth Doc',
  timezone: 'Australia/Perth',
  windows: [
    { dayOfWeek: 'Thursday', startMinutes: 7 * 60, endMinutes: 14 * 60 },
    { dayOfWeek: 'Thursday', startMinutes: 15 * 60, endMinutes: 17 * 60 },
  ],
};

// Pin "now" to a known UTC instant. 6 May 2026 00:00 UTC is a Wednesday.
const FIXED_NOW = new Date('2026-05-06T00:00:00Z');

describe('generateSlotsForDoctor', () => {
  it('produces 30-minute slots inside each window', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      const start = new Date(slot.startISO);
      const end = new Date(slot.endISO);
      expect((end.getTime() - start.getTime()) / 60_000).toBe(SLOT_MINUTES);
    }
  });

  it('does not extend past the window end (drops sub-30 tail)', () => {
    const doctor: Doctor = {
      id: 'short-doc',
      name: 'Short Doc',
      timezone: 'Australia/Sydney',
      windows: [{ dayOfWeek: 'Monday', startMinutes: 9 * 60, endMinutes: 9 * 60 + 45 }],
    };
    const slots = generateSlotsForDoctor(doctor, { now: FIXED_NOW });
    // Only one full 30-min slot fits in 45 minutes (9:00-9:30).
    expect(slots).toHaveLength(1);
    expect(slots[0].label).toContain('9:00 AM');
    expect(slots[0].label).toContain('9:30 AM');
  });

  it('returns no slots for windows shorter than 30 minutes', () => {
    const doctor: Doctor = {
      id: 'tiny',
      name: 'Tiny',
      timezone: 'Australia/Sydney',
      windows: [{ dayOfWeek: 'Monday', startMinutes: 9 * 60, endMinutes: 9 * 60 + 20 }],
    };
    const slots = generateSlotsForDoctor(doctor, { now: FIXED_NOW });
    expect(slots).toHaveLength(0);
  });

  it('handles multiple windows on the same day', () => {
    const slots = generateSlotsForDoctor(perthMultiWindow, { now: FIXED_NOW });
    const thursdaySlots = slots.filter((s) => s.dayOfWeek === 'Thursday');
    // 7:00-14:00 = 7h = 14 slots; 15:00-17:00 = 2h = 4 slots; total 18.
    expect(thursdaySlots).toHaveLength(18);
  });

  it('produces slots in ascending start order', () => {
    const slots = generateSlotsForDoctor(perthMultiWindow, { now: FIXED_NOW });
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i - 1].startISO <= slots[i].startISO).toBe(true);
    }
  });

  it('returns empty array for a doctor with no windows', () => {
    const empty: Doctor = {
      id: 'empty',
      name: 'Empty',
      timezone: 'Australia/Sydney',
      windows: [],
    };
    expect(generateSlotsForDoctor(empty, { now: FIXED_NOW })).toEqual([]);
  });

  it('respects daysAhead option', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW, daysAhead: 1 });
    // 6 May 2026 is Wednesday Sydney time; doctor only has Monday/Tuesday windows.
    expect(slots).toEqual([]);
  });

  it('generates correct slots for Monday given a Wednesday baseline (looks 7 days ahead)', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    const mondaySlots = slots.filter((s) => s.dayOfWeek === 'Monday');
    // 9:00-17:30 = 8.5 hours = 17 slots
    expect(mondaySlots).toHaveLength(17);
  });

  it('encodes labels in 12-hour format', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    for (const slot of slots) {
      expect(slot.label).toMatch(/^\d{1,2}:\d{2} (AM|PM) – \d{1,2}:\d{2} (AM|PM)$/);
    }
  });

  it('emits ISO start times in UTC', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    for (const slot of slots) {
      expect(slot.startISO).toMatch(/Z$/);
      expect(slot.endISO).toMatch(/Z$/);
    }
  });

  it('respects timezone — Sydney 9:00 AM is 23:00 UTC the prior day in May (AEST, no DST)', () => {
    // First Monday after 6 May 2026 (Wed) is 11 May 2026.
    // Sydney is AEST (UTC+10) in May (no DST until October).
    // 9:00 AM AEST on 11 May 2026 = 23:00 UTC on 10 May 2026.
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    const firstMonday = slots.find((s) => s.dayOfWeek === 'Monday');
    expect(firstMonday).toBeDefined();
    expect(firstMonday!.startISO).toBe('2026-05-10T23:00:00.000Z');
  });
});

describe('groupSlotsByDate', () => {
  it('groups slots by date in ascending order', () => {
    const slots = generateSlotsForDoctor(sydneyDoctor, { now: FIXED_NOW });
    const groups = groupSlotsByDate(slots);
    expect(groups.length).toBeGreaterThan(0);
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i - 1].date < groups[i].date).toBe(true);
    }
  });

  it('returns empty for empty input', () => {
    expect(groupSlotsByDate([])).toEqual([]);
  });
});
