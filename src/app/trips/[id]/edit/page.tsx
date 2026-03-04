'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Button from '@/components/Button';
import TripForm, { TripFormData } from '@/components/TripForm';
import { Trip } from '@/types';

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [initialData, setInitialData] = useState<Partial<TripFormData> | undefined>(undefined);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch('/api/trips').then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([authData, tripsData]) => {
        setUser(authData.user);
        const trip: Trip | undefined = tripsData.trips.find((t: Trip) => t.id === tripId);
        if (trip) {
          setInitialData({
            load_date: trip.load_date.slice(0, 16),
            unload_date: trip.unload_date ? trip.unload_date.slice(0, 16) : '',
            load_points: trip.load_points as any,
            unload_points: trip.unload_points as any,
            driver_name: trip.driver_name,
            driver_phone: trip.driver_phone,
            vehicle_info: trip.vehicle_info || '',
            owner_name: trip.owner_name || '',
            owner_phone: trip.owner_phone || '',
            client_name: trip.client_name,
            client_phone: trip.client_phone || '',
            client_payment: trip.client_payment.toString(),
            my_margin: trip.my_margin.toString(),
            margin_payer: trip.margin_payer.toLowerCase() as 'client' | 'owner',
            status: trip.status,
          });
        }
      })
      .catch(() => router.push('/auth/login'))
      .finally(() => setPageLoading(false));
  }, [router, tripId]);

  const handleSubmit = async (data: TripFormData) => {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      throw new Error('Помилка оновлення рейсу');
    }
  };

  if (pageLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Завантаження рейсу...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-500 mb-1">Редагування</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Оновлення рейсу
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
              Коригуйте маршрут, учасників та фінансові дані
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/dashboard')} className="!rounded-xl shadow-sm self-start sm:self-auto">
            ← Назад
          </Button>
        </div>

        {initialData !== undefined ? (
          <TripForm mode="edit" initialData={initialData} onSubmit={handleSubmit} tripId={tripId} />
        ) : (
          <div className="text-center py-20 text-slate-400">Рейс не знайдено</div>
        )}
      </main>
    </div>
  );
}
