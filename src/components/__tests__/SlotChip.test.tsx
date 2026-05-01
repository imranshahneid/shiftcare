import { fireEvent, render } from '@testing-library/react-native';
import { SlotChip } from '../SlotChip';
import { Slot } from '@/domain/types';

const slot: Slot = {
  doctorId: 'doc-1',
  doctorName: 'Doc',
  timezone: 'Australia/Sydney',
  dayOfWeek: 'Monday',
  date: '2026-05-11',
  startISO: '2026-05-10T23:00:00.000Z',
  endISO: '2026-05-10T23:30:00.000Z',
  label: '9:00 AM – 9:30 AM',
};

describe('SlotChip', () => {
  it('renders the slot label', () => {
    const { getByText } = render(<SlotChip slot={slot} booked={false} onPress={() => {}} />);
    expect(getByText('9:00 AM – 9:30 AM')).toBeTruthy();
  });

  it('calls onPress when not booked', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<SlotChip slot={slot} booked={false} onPress={onPress} />);
    fireEvent.press(getByTestId(`slot-${slot.startISO}`));
    expect(onPress).toHaveBeenCalledWith(slot);
  });

  it('does not call onPress when booked', () => {
    const onPress = jest.fn();
    const { getByTestId, getByText } = render(
      <SlotChip slot={slot} booked={true} onPress={onPress} />,
    );
    fireEvent.press(getByTestId(`slot-${slot.startISO}`));
    expect(onPress).not.toHaveBeenCalled();
    expect(getByText('Booked')).toBeTruthy();
  });
});
