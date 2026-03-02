import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { TripInput } from '@/lib/validations/trip';

export interface Trip {
  id: string;
  load_date: string;
  unload_date: string | null;
  driver_name: string;
  driver_phone: string;
  vehicle_info: string;
  owner_name: string | null;
  owner_phone: string | null;
  client_name: string;
  client_phone: string | null;
  client_payment: number;
  my_margin: number;
  margin_payer: string;
  status: string;
  load_points: Array<{
    name: string;
    lat: number;
    lng: number;
    displayName: string;
  }>;
  unload_points: Array<{
    name: string;
    lat: number;
    lng: number;
    displayName: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Fetch all trips
async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch('/api/trips');
  if (!res.ok) {
    throw new Error('Failed to fetch trips');
  }
  const data = await res.json();
  return data.trips;
}

// Fetch single trip
async function fetchTrip(id: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch trip');
  }
  const data = await res.json();
  return data.trip;
}

// Create trip
async function createTrip(data: TripInput): Promise<Trip> {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create trip');
  }

  const result = await res.json();
  return result.trip;
}

// Update trip
async function updateTrip({ id, data }: { id: string; data: TripInput }): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update trip');
  }

  const result = await res.json();
  return result.trip;
}

// Update trip status
async function updateTripStatus({ id, status }: { id: string; status: string }): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update status');
  }

  const result = await res.json();
  return result.trip;
}

// Delete trip
async function deleteTrip(id: string): Promise<void> {
  const res = await fetch(`/api/trips/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete trip');
  }
}

// Hook для отримання всіх рейсів
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: fetchTrips,
    staleTime: 30 * 1000, // 30 секунд
  });
}

// Hook для отримання одного рейсу
export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => fetchTrip(id),
    enabled: !!id,
  });
}

// Hook для створення рейсу
export function useCreateTrip() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: (newTrip) => {
      // Оновити список рейсів
      queryClient.setQueryData<Trip[]>(['trips'], (old) => 
        old ? [newTrip, ...old] : [newTrip]
      );
      router.push('/dashboard');
    },
  });
}

// Hook для оновлення рейсу
export function useUpdateTrip() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: updateTrip,
    onSuccess: (updatedTrip) => {
      // Оновити конкретний рейс
      queryClient.setQueryData(['trips', updatedTrip.id], updatedTrip);
      
      // Оновити список рейсів
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)) : [updatedTrip]
      );
      
      router.push('/dashboard');
    },
  });
}

// Hook для оновлення статусу
export function useUpdateTripStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTripStatus,
    onSuccess: (updatedTrip) => {
      // Оновити конкретний рейс
      queryClient.setQueryData(['trips', updatedTrip.id], updatedTrip);
      
      // Оновити список рейсів
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.map((trip) => (trip.id === updatedTrip.id ? updatedTrip : trip)) : [updatedTrip]
      );
    },
  });
}

// Hook для видалення рейсу
export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: (_, deletedId) => {
      // Видалити з кешу
      queryClient.removeQueries({ queryKey: ['trips', deletedId] });
      
      // Оновити список рейсів
      queryClient.setQueryData<Trip[]>(['trips'], (old) =>
        old ? old.filter((trip) => trip.id !== deletedId) : []
      );
    },
  });
}
