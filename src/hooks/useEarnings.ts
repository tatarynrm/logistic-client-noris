import { useQuery } from '@tanstack/react-query';
import type { Trip } from './useTrips';

interface EarningsData {
  trips: Trip[];
  summary: {
    totalMargin: number;
    totalPayment: number;
    tripCount: number;
  };
}

async function fetchEarnings(startDate: string, endDate: string): Promise<EarningsData> {
  const res = await fetch(
    `/api/earnings?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch earnings');
  }

  return res.json();
}

export function useEarnings(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['earnings', startDate, endDate],
    queryFn: () => fetchEarnings(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 хвилини
  });
}
