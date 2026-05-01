import { Alert } from 'react-native';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { MyBookingsScreen } from '../MyBookingsScreen';
import { useBookingsStore } from '@/store/bookingsStore';
import { Slot } from '@/domain/types';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

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

beforeEach(() => {
  useBookingsStore.getState()._reset();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('MyBookingsScreen', () => {
  it('shows empty state when no bookings exist', () => {
    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);
    expect(getByTestId('empty-state')).toBeTruthy();
  });

  it('renders bookings sorted by start time', () => {
    useBookingsStore.getState().addBooking(slot1);
    useBookingsStore.getState().addBooking({
      ...slot1,
      startISO: '2026-05-11T23:00:00.000Z',
      endISO: '2026-05-11T23:30:00.000Z',
      label: '9:00 AM – 9:30 AM (Tue)',
    });
    const { getByTestId, getAllByText } = renderWithProviders(<MyBookingsScreen />);
    expect(getByTestId('bookings-list')).toBeTruthy();
    expect(getAllByText('Sydney Doc').length).toBe(2);
  });

  it('opens a confirm dialog when cancel is tapped', () => {
    const booking = useBookingsStore.getState().addBooking(slot1);
    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);
    fireEvent.press(getByTestId(`cancel-${booking!.id}`));
    expect(Alert.alert).toHaveBeenCalledWith(
      'Cancel booking?',
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Keep' }),
        expect.objectContaining({ text: 'Cancel booking' }),
      ]),
    );
  });

  it('cancel handler removes the booking when confirmed', () => {
    const booking = useBookingsStore.getState().addBooking(slot1);
    let confirmHandler: (() => void) | undefined;
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
      const destructive = (buttons as { text: string; onPress?: () => void }[]).find(
        (b) => b.text === 'Cancel booking',
      );
      confirmHandler = destructive?.onPress;
    });
    const { getByTestId } = renderWithProviders(<MyBookingsScreen />);
    fireEvent.press(getByTestId(`cancel-${booking!.id}`));
    confirmHandler?.();
    expect(useBookingsStore.getState().bookings).toHaveLength(0);
  });
});
