import { fireEvent, render } from '@testing-library/react-native';
import { DoctorCard } from '../DoctorCard';
import { Doctor } from '@/domain/types';

const doctor: Doctor = {
  id: 'sydney-doc',
  name: 'Sydney Doc',
  timezone: 'Australia/Sydney',
  windows: [
    { dayOfWeek: 'Monday', startMinutes: 540, endMinutes: 1050 },
    { dayOfWeek: 'Tuesday', startMinutes: 480, endMinutes: 960 },
  ],
};

describe('DoctorCard', () => {
  it('renders the doctor name and timezone', () => {
    const { getByText } = render(<DoctorCard doctor={doctor} onPress={() => {}} />);
    expect(getByText('Sydney Doc')).toBeTruthy();
    expect(getByText('Australia/Sydney')).toBeTruthy();
  });

  it('shows the count of unique days available', () => {
    const { getByText } = render(<DoctorCard doctor={doctor} onPress={() => {}} />);
    expect(getByText('2 days available this week')).toBeTruthy();
  });

  it('uses singular grammar for one day', () => {
    const single: Doctor = { ...doctor, windows: [doctor.windows[0]] };
    const { getByText } = render(<DoctorCard doctor={single} onPress={() => {}} />);
    expect(getByText('1 day available this week')).toBeTruthy();
  });

  it('calls onPress with the doctor', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<DoctorCard doctor={doctor} onPress={onPress} />);
    fireEvent.press(getByTestId('doctor-card-sydney-doc'));
    expect(onPress).toHaveBeenCalledWith(doctor);
  });
});
