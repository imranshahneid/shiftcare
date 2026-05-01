import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { DoctorAvailabilityScreen } from '../DoctorAvailabilityScreen';
import { useBookingsStore } from '@/store/bookingsStore';
import { Doctor } from '@/domain/types';
import { generateSlotsForDoctor } from '@/domain/slots';

const mockNavigate = jest.fn();
const mockUseRoute = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => mockUseRoute(),
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

const doctor: Doctor = {
  id: 'sydney-doc',
  name: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  windows: [
    { dayOfWeek: 'Monday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Tuesday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Wednesday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Thursday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Friday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Saturday', startMinutes: 540, endMinutes: 600 },
    { dayOfWeek: 'Sunday', startMinutes: 540, endMinutes: 600 },
  ],
};

const emptyDoctor: Doctor = {
  id: 'no-slots',
  name: 'Quiet Doc',
  timezone: 'Australia/Sydney',
  windows: [],
};

beforeEach(() => {
  useBookingsStore.getState()._reset();
  mockNavigate.mockReset();
  mockUseRoute.mockReturnValue({ params: { doctor } });
});

describe('DoctorAvailabilityScreen', () => {
  it('renders an empty state for a doctor with no windows', () => {
    mockUseRoute.mockReturnValue({ params: { doctor: emptyDoctor } });
    const { getByTestId } = renderWithProviders(<DoctorAvailabilityScreen />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('renders the timezone notice', () => {
    const { getByTestId } = renderWithProviders(<DoctorAvailabilityScreen />);
    expect(getByTestId('tz-notice')).toBeTruthy();
  });

  it('navigates to BookingConfirmation when an available slot is tapped', () => {
    const slots = generateSlotsForDoctor(doctor);
    expect(slots.length).toBeGreaterThan(0);
    const { getByTestId } = renderWithProviders(<DoctorAvailabilityScreen />);
    fireEvent.press(getByTestId(`slot-${slots[0].startISO}`));
    expect(mockNavigate).toHaveBeenCalledWith(
      'BookingConfirmation',
      expect.objectContaining({ doctor, slot: expect.objectContaining({ startISO: slots[0].startISO }) }),
    );
  });

  it('disables a slot that is already booked', () => {
    const slots = generateSlotsForDoctor(doctor);
    expect(slots.length).toBeGreaterThan(0);
    useBookingsStore.getState().addBooking(slots[0]);
    const { getByTestId } = renderWithProviders(<DoctorAvailabilityScreen />);
    fireEvent.press(getByTestId(`slot-${slots[0].startISO}`));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
