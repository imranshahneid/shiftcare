import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { uuidv4 } from '@/domain/id';
import { Booking, Slot, bookingKey } from '@/domain/types';

type BookingDraft = Omit<Booking, 'id' | 'createdAtISO'>;

export type BookingsState = {
  bookings: Booking[];
  hasHydrated: boolean;
  addBooking: (slot: Slot) => Booking | null;
  cancelBooking: (id: string) => void;
  isSlotBooked: (doctorId: string, startISO: string) => boolean;
  setHasHydrated: (value: boolean) => void;
  _reset: () => void;
};

const slotToDraft = (slot: Slot): BookingDraft => ({
  doctorId: slot.doctorId,
  doctorName: slot.doctorName,
  timezone: slot.timezone,
  dayOfWeek: slot.dayOfWeek,
  date: slot.date,
  startISO: slot.startISO,
  endISO: slot.endISO,
  label: slot.label,
});

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],
      hasHydrated: false,

      addBooking: (slot) => {
        const key = bookingKey(slot.doctorId, slot.startISO);
        const exists = get().bookings.some(
          (b) => bookingKey(b.doctorId, b.startISO) === key,
        );
        if (exists) return null;

        const booking: Booking = {
          id: uuidv4(),
          createdAtISO: new Date().toISOString(),
          ...slotToDraft(slot),
        };
        set((state) => ({ bookings: [...state.bookings, booking] }));
        return booking;
      },

      cancelBooking: (id) => {
        set((state) => ({ bookings: state.bookings.filter((b) => b.id !== id) }));
      },

      isSlotBooked: (doctorId, startISO) => {
        const key = bookingKey(doctorId, startISO);
        return get().bookings.some((b) => bookingKey(b.doctorId, b.startISO) === key);
      },

      setHasHydrated: (value) => set({ hasHydrated: value }),

      _reset: () => set({ bookings: [], hasHydrated: true }),
    }),
    {
      name: 'shiftcare:bookings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ bookings: state.bookings }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const selectBookedKeys = (state: BookingsState): Set<string> => {
  const set = new Set<string>();
  for (const b of state.bookings) {
    set.add(bookingKey(b.doctorId, b.startISO));
  }
  return set;
};

export const selectBookingsForDoctor = (doctorId: string) => (state: BookingsState): Booking[] =>
  state.bookings
    .filter((b) => b.doctorId === doctorId)
    .sort((a, b) => a.startISO.localeCompare(b.startISO));

export const selectAllBookingsSorted = (state: BookingsState): Booking[] =>
  [...state.bookings].sort((a, b) => a.startISO.localeCompare(b.startISO));
