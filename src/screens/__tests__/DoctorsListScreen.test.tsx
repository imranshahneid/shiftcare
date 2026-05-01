import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { DoctorsListScreen } from '../DoctorsListScreen';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

const SAMPLE = [
  {
    name: 'Christy Schumm',
    timezone: 'Australia/Sydney',
    day_of_week: 'Monday',
    available_at: ' 9:00AM',
    available_until: ' 5:30PM',
  },
  {
    name: 'Dr. Geovany Keebler',
    timezone: 'Australia/Perth',
    day_of_week: 'Thursday',
    available_at: ' 7:00AM',
    available_until: ' 2:00PM',
  },
];

beforeEach(() => {
  mockNavigate.mockReset();
});

describe('DoctorsListScreen', () => {
  it('shows loading state while fetching', () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    const { getByTestId } = renderWithProviders(<DoctorsListScreen />);
    expect(getByTestId('loading-state')).toBeTruthy();
  });

  it('shows error state with retry on fetch failure', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) } as Response),
    ) as unknown as typeof fetch;
    const { findByTestId } = renderWithProviders(<DoctorsListScreen />);
    expect(await findByTestId('error-state')).toBeTruthy();
    expect(await findByTestId('error-retry')).toBeTruthy();
  });

  it('renders a list of doctors on success', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(SAMPLE) } as Response),
    ) as unknown as typeof fetch;
    const { findByText } = renderWithProviders(<DoctorsListScreen />);
    expect(await findByText('Christy Schumm')).toBeTruthy();
    expect(await findByText('Dr. Geovany Keebler')).toBeTruthy();
  });

  it('renders empty state when API returns no doctors', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve([]) } as Response),
    ) as unknown as typeof fetch;
    const { findByTestId } = renderWithProviders(<DoctorsListScreen />);
    expect(await findByTestId('empty-state')).toBeTruthy();
  });

  it('handles network errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network down'))) as unknown as typeof fetch;
    const { findByTestId, findByText } = renderWithProviders(<DoctorsListScreen />);
    expect(await findByTestId('error-state')).toBeTruthy();
    await waitFor(() => expect(findByText(/Network down/)).resolves.toBeTruthy());
  });
});
