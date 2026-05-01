import { Doctor, Slot } from '@/domain/types';

export type RootStackParamList = {
  DoctorsList: undefined;
  DoctorAvailability: { doctor: Doctor };
  BookingConfirmation: { doctor: Doctor; slot: Slot };
  MyBookings: undefined;
};
