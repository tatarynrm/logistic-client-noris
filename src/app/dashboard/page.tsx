'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trip, LocationPoint } from '@/types';
import TripCard from '@/components/TripCard';
import Button from '@/components/Button';
import Navigation from '@/components/Navigation';
import Modal from '@/components/Modal';
import { io, Socket } from 'socket.io-client';
import { usePersistedState } from '@/hooks/usePersistedState';

import Skeleton from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [, setSocket] = useState<Socket | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>(
    (searchParams.get('filter') as any) || 'all'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [itemsPerPage, setItemsPerPage] = usePersistedState<number>('tripsPerPage', 10);

  useEffect(() => {
    loadUser();
    loadTrips();
  }, []);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io({
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      socketInstance.emit('join-user-room', user.id);
    });

    socketInstance.on('trip-created', (newTrip: Trip) => {
      setTrips(prev => [newTrip, ...prev]);
    });

    socketInstance.on('trip-updated', (updatedTrip: Trip) => {
      setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
    });

    socketInstance.on('trip-deleted', ({ id }: { id: string }) => {
      setTrips(prev => prev.filter(t => t.id !== id));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    updateURL();
  }, [filter, searchQuery, currentPage]);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('filter', filter);
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `?${params.toString()}` : '/dashboard';
    window.history.replaceState({}, '', newURL);
  };

  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const loadTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Помилка завантаження рейсів');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    setTripToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!tripToDelete) return;

    try {
      await fetch(`/api/trips/${tripToDelete}`, { method: 'DELETE' });
      setDeleteModalOpen(false);
      setTripToDelete(null);
    } catch (error) {
      console.error('Помилка видалення рейсу');
    }
  };

  const handleStatusChange = async (id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    try {
      await fetch(`/api/trips/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error('Помилка оновлення статусу');
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const searchInTrip = (trip: Trip, query: string): boolean => {
    const lowerQuery = query.toLowerCase();
    const loadPoints = (trip.load_points as unknown as LocationPoint[]) || [];
    const unloadPoints = (trip.unload_points as unknown as LocationPoint[]) || [];
    
    const locationMatch = [...loadPoints, ...unloadPoints].some(point => 
      point.displayName.toLowerCase().includes(lowerQuery) ||
      point.name.toLowerCase().includes(lowerQuery)
    );
    
    return (
      locationMatch ||
      trip.driver_name.toLowerCase().includes(lowerQuery) ||
      trip.driver_phone.includes(lowerQuery) ||
      trip.client_name.toLowerCase().includes(lowerQuery) ||
      ((trip as any).owner_name && (trip as any).owner_name.toLowerCase().includes(lowerQuery)) ||
      ((trip as any).owner_phone && (trip as any).owner_phone.includes(lowerQuery)) ||
      ((trip as any).vehicle_info && (trip as any).vehicle_info.toLowerCase().includes(lowerQuery)) ||
      ((trip as any).client_phone && (trip as any).client_phone.includes(lowerQuery)) ||
      trip.client_payment.toString().includes(lowerQuery) ||
      trip.my_margin.toString().includes(lowerQuery)
    );
  };

  const filteredTrips = trips.filter(trip => {
    const matchesFilter = filter === 'all' || trip.status === filter;
    const matchesSearch = !searchQuery || searchInTrip(trip, searchQuery);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  const stats = {
    total: trips.length,
    pending: trips.filter(t => t.status === 'PENDING').length,
    inProgress: trips.filter(t => t.status === 'IN_PROGRESS').length,
    completed: trips.filter(t => t.status === 'COMPLETED').length,
    cancelled: trips.filter(t => t.status === 'CANCELLED').length,
    totalMargin: trips.reduce((sum, t) => sum + t.my_margin, 0),
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4"></div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Авторизація...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-12">
          {loading ? (
             Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Всього</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stats.total}</p>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5rem] shadow-sm border border-amber-100 dark:border-amber-900/30 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Очікують</p>
                <p className="text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{stats.pending}</p>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-[2.5rem] shadow-sm border border-blue-100 dark:border-blue-900/30 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">В дорозі</p>
                <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{stats.inProgress}</p>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2.5rem] shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">Завершено</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.completed}</p>
              </div>
              <div className="bg-rose-50/50 dark:bg-rose-900/10 rounded-[2.5rem] shadow-sm border border-rose-100 dark:border-rose-900/30 p-6 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2">Скасовано</p>
                <p className="text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{stats.cancelled}</p>
              </div>
              <div className="bg-violet-600 rounded-[2.5rem] shadow-glow border-none p-6 transition-all hover:shadow-2xl hover:-translate-y-1 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Прибуток</p>
                <p className="text-2xl font-black truncate relative z-10" title={`${stats.totalMargin} грн`}>{stats.totalMargin} <span className="text-xs opacity-60">грн</span></p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="flex-1 w-full relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
              <input
                type="text"
                placeholder="Пошук маршруту, водія, номеру авто..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            {searchQuery && (
              <Button variant="secondary" onClick={() => handleSearchChange('')} className="!rounded-2xl">
                Очистити
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto scrollbar-hide px-2">
            {(['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  filter === s
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s === 'all' ? 'Всі рейси' : s === 'PENDING' ? 'Очікую' : s === 'IN_PROGRESS' ? 'В дорозі' : s === 'COMPLETED' ? 'Завершено' : 'Скасовано'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 px-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Показувати:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm"
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
           <div className="grid grid-cols-1 gap-6">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[2.5rem]" />)}
           </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState 
            title={searchQuery ? "Нічого не знайдено" : "Рейсів поки немає"}
            description={searchQuery ? "Перевірте правильність пошукового запиту або змініть фільтри." : "Зареєструйте перший рейс у системі для початку роботи."}
            icon={searchQuery ? "🕵️" : "🚚"}
            actionLabel={!searchQuery ? "Створити рейс" : undefined}
            onAction={!searchQuery ? () => router.push('/trips/new') : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 animate-fade-in mb-10">
              {paginatedTrips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={() => handleDeleteTrip(trip.id)}
                  onStatusChange={(status) => handleStatusChange(trip.id, status)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="!rounded-2xl"
                >
                  ←
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                        currentPage === page
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-110'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="!rounded-2xl"
                >
                  →
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Підтвердження видалення"
        size="sm"
      >
        <div className="space-y-6 p-2">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Ви впевнені, що хочете видалити цей рейс? Цю дію неможливо скасувати.
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1 !rounded-2xl"
            >
              Скасувати
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1 !rounded-2xl !bg-rose-500 hover:!bg-rose-600 shadow-glow-rose"
            >
              Видалити
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Завантаження...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
