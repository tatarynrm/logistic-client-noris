'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Button from '@/components/Button';
import TripForm, { TripFormData } from '@/components/TripForm';

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user))
      .catch(() => router.push('/auth/login'));
  }, [router]);

  const handleSubmit = async (data: TripFormData) => {
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      throw new Error('Помилка створення рейсу');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Завантаження...</p>
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
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-500 mb-1">Новий рейс</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Реєстрація перевезення
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium text-sm">
              Заповніть маршрут, учасників та фінансові дані
            </p>
          </div>
          <Button variant="secondary" onClick={() => router.push('/dashboard')} className="!rounded-xl shadow-sm self-start sm:self-auto">
            ← Назад
          </Button>
        </div>

        <TripForm mode="create" onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
