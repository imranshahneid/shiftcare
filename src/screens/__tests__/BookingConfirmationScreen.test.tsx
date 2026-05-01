import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { BookingConfirmationScreen } from '../BookingConfirmationScreen';
import { useBookingsStore } from '@/store/bookingsStore';
import { Doctor, Slot } from '@/domain/types';

const mockReset = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => ({ params: { doctor, slot } }),
    useNavigation: () => ({ reset: mockReset, goBack: mockGoBack }),
  };
});

const doctor: Doctor = {
  id: 'sydney-doc',
  name: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  windows: [{ dayOfWeek: 'Monday', startMinutes: 540, endMinutes: 1050 }],
};

const slot: Slot = {
  doctorId: 'sydney-doc',
  doctorName: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  dayOfWeek: 'Monday',
  date: '2026-05-11',
  startISO: '2026-05-10T23:00:00.000Z',
  endISO: '2026-05-10T23:30:00.000Z',
  label: '9:00 AM – 9:30 AM',
};

beforeEach(() => {
  useBookingsStore.getState()._reset();
  mockReset.mockReset();
  mockGoBack.mockReset();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('BookingConfirmationScreen', () => {
  it('renders the slot details', () => {
    const { getByText, getByTestId } = renderWithProviders(<BookingConfirmationScreen />);
    expect(getByTestId('confirmation-card')).toBeTruthy();
    expect(getByText('Sydney Doc')).toBeTruthy();
    expect(getByText('9:00 AM – 9:30 AM')).toBeTruthy();
    expect(getByText('Australia/Sydney')).toBeTruthy();
  });

  it('confirms the booking and navigates to MyBookings', () => {
    const { getByTestId } = renderWithProviders(<BookingConfirmationScreen />);
    fireEvent.press(getByTestId('confirm-button'));
    expect(useBookingsStore.getState().bookings).toHaveLength(1);
    expect(mockReset).toHaveBeenCalled();
  });

  it('disables confirmation when the slot is already booked', () => {
    useBookingsStore.getState().addBooking(slot);
    const { getByTestId, getByText } = renderWithProviders(<BookingConfirmationScreen />);
    expect(getByText('Already booked')).toBeTruthy();
    fireEvent.press(getByTestId('confirm-button'));
    // Disabled button does not navigate, and no second booking is created.
    expect(useBookingsStore.getState().bookings).toHaveLength(1);
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('cancel button navigates back', () => {
    const { getByTestId } = renderWithProviders(<BookingConfirmationScreen />);
    fireEvent.press(getByTestId('cancel-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });
});
