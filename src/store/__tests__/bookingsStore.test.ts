import {
  useBookingsStore,
  selectBookedKeys,
  selectBookingsForDoctor,
  selectAllBookingsSorted,
} from '../bookingsStore';
import { Slot } from '@/domain/types';

const slot1: Slot = {
  doctorId: 'sydney-doc',
  doctorName: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  dayOfWeek: 'Monday',
  date: '2026-05-11',
  startISO: '2026-05-10T23:00:00.000Z',
  endISO: '2026-05-10T23:30:00.000Z',
  label: '9:00 AM – 9:30 AM',
};

const slot2: Slot = {
  ...slot1,
  startISO: '2026-05-10T23:30:00.000Z',
  endISO: '2026-05-11T00:00:00.000Z',
  label: '9:30 AM – 10:00 AM',
};

const otherDoctorSlot: Slot = {
  ...slot1,
  doctorId: 'perth-doc',
  doctorName: 'Perth Doc',
  timezone: 'Australia/Perth',
  startISO: '2026-05-13T23:00:00.000Z',
  endISO: '2026-05-13T23:30:00.000Z',
  date: '2026-05-14',
  dayOfWeek: 'Thursday',
  label: '7:00 AM – 7:30 AM',
};

beforeEach(() => {
  useBookingsStore.getState()._reset();
});

describe('bookingsStore', () => {
  it('starts empty', () => {
    expect(useBookingsStore.getState().bookings).toEqual([]);
  });

  it('addBooking creates a booking with id and timestamp', () => {
    const result = useBookingsStore.getState().addBooking(slot1);
    expect(result).not.toBeNull();
    expect(result!.id).toBeDefined();
    expect(result!.createdAtISO).toBeDefined();
    expect(useBookingsStore.getState().bookings).toHaveLength(1);
  });

  it('addBooking is idempotent on the same doctor/start combo', () => {
    useBookingsStore.getState().addBooking(slot1);
    const second = useBookingsStore.getState().addBooking(slot1);
    expect(second).toBeNull();
    expect(useBookingsStore.getState().bookings).toHaveLength(1);
  });

  it('two different slots from same doctor can both be booked', () => {
    useBookingsStore.getState().addBooking(slot1);
    useBookingsStore.getState().addBooking(slot2);
    expect(useBookingsStore.getState().bookings).toHaveLength(2);
  });

  it('cancelBooking removes the booking', () => {
    const booking = useBookingsStore.getState().addBooking(slot1);
    useBookingsStore.getState().cancelBooking(booking!.id);
    expect(useBookingsStore.getState().bookings).toHaveLength(0);
  });

  it('cancelBooking with unknown id is a no-op', () => {
    useBookingsStore.getState().addBooking(slot1);
    useBookingsStore.getState().cancelBooking('does-not-exist');
    expect(useBookingsStore.getState().bookings).toHaveLength(1);
  });

  it('isSlotBooked reflects current state', () => {
    expect(useBookingsStore.getState().isSlotBooked(slot1.doctorId, slot1.startISO)).toBe(false);
    useBookingsStore.getState().addBooking(slot1);
    expect(useBookingsStore.getState().isSlotBooked(slot1.doctorId, slot1.startISO)).toBe(true);
  });

  it('isSlotBooked is keyed by doctorId AND startISO', () => {
    useBookingsStore.getState().addBooking(slot1);
    expect(useBookingsStore.getState().isSlotBooked('different-doc', slot1.startISO)).toBe(false);
    expect(useBookingsStore.getState().isSlotBooked(slot1.doctorId, slot2.startISO)).toBe(false);
  });

  describe('selectors', () => {
    it('selectBookedKeys returns a Set of doctor|startISO keys', () => {
      useBookingsStore.getState().addBooking(slot1);
      useBookingsStore.getState().addBooking(otherDoctorSlot);
      const keys = selectBookedKeys(useBookingsStore.getState());
      expect(keys.size).toBe(2);
      expect(keys.has(`${slot1.doctorId}|${slot1.startISO}`)).toBe(true);
      expect(keys.has(`${otherDoctorSlot.doctorId}|${otherDoctorSlot.startISO}`)).toBe(true);
    });

    it('selectBookingsForDoctor filters and sorts by start time', () => {
      useBookingsStore.getState().addBooking(slot2);
      useBookingsStore.getState().addBooking(slot1);
      useBookingsStore.getState().addBooking(otherDoctorSlot);
      const forSydney = selectBookingsForDoctor('sydney-doc')(useBookingsStore.getState());
      expect(forSydney).toHaveLength(2);
      expect(forSydney[0].startISO < forSydney[1].startISO).toBe(true);
    });

    it('selectAllBookingsSorted returns all bookings ordered by start time', () => {
      useBookingsStore.getState().addBooking(otherDoctorSlot);
      useBookingsStore.getState().addBooking(slot1);
      const all = selectAllBookingsSorted(useBookingsStore.getState());
      expect(all).toHaveLength(2);
      expect(all[0].startISO).toBe(slot1.startISO);
    });
  });
});
