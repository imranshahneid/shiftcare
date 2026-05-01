import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { groupDoctors } from '@/domain/doctors';
import { Doctor } from '@/domain/types';

export const DOCTORS_ENDPOINT =
  'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json';

export const fetchDoctors = async (signal?: AbortSignal): Promise<Doctor[]> => {
  const response = await fetch(DOCTORS_ENDPOINT, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load doctors: HTTP ${response.status}`);
  }
  const json = (await response.json()) as unknown;
  return groupDoctors(json);
};

export const useDoctorsQuery = (): UseQueryResult<Doctor[], Error> =>
  useQuery({
    queryKey: ['doctors'],
    queryFn: ({ signal }) => fetchDoctors(signal),
  });
