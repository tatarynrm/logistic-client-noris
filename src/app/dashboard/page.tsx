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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950">
        <div className="w-24 h-24 rounded-full border-t-2 border-cyan-500 animate-spin mb-8"></div>
        <p className="font-display font-black text-white uppercase tracking-[0.5em] animate-pulse">Initializing System...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-slate-950 selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] bg-[length:32px_32px]"></div>
      </div>

      <Navigation user={user} />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-20">

        {/* Stats Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-16">
          {loading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-[2.5rem] bg-white/5" />)
          ) : (
            <>
              <StatCard label="Усі" value={stats.total} />
              <StatCard label="Очікується" value={stats.pending} color="text-amber-500" />
              <StatCard label="В дорозі" value={stats.inProgress} color="text-cyan-500" />
              <StatCard label="Завершено" value={stats.completed} color="text-emerald-500" />
              <StatCard label="Скасовано" value={stats.cancelled} color="text-rose-500" />
              <div className="col-span-2 lg:col-span-1 glass-card p-8 flex flex-col justify-between border-cyan-500/20 bg-cyan-500/5 group hover:border-cyan-500 transition-all duration-700">
                <p className="text-[10px] font-display font-black text-cyan-500 uppercase tracking-widest">Revenue</p>
                <div className="space-y-1">
                  <p className="text-3xl font-display font-black text-white tracking-tighter truncate leading-none">
                    {stats.totalMargin}
                  </p>
                  <p className="text-[10px] font-display font-black text-cyan-500/50 uppercase tracking-widest">UAH Total</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
              🔍
            </div>
            <input
              type="text"
              placeholder="Пошук..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-16 pr-8 py-6 glass rounded-full border-white/5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all font-display font-bold text-lg"
            />
          </div>

          <div className="flex items-center justify-between p-2 glass rounded-full border-white/5 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {(['all', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleFilterChange(s)}
                  className={`px-8 py-4 rounded-full text-[10px] font-display font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${filter === s
                    ? 'bg-cyan-500 text-slate-950 shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {s === 'all' ? 'Всі рейси' : s === 'PENDING' ? 'Очікується' : s === 'IN_PROGRESS' ? 'В дорозі' : s === 'COMPLETED' ? 'Завершено' : 'Скасовано'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[3rem] bg-white/5" />)}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="glass-card py-32 flex flex-col items-center border-dashed border-white/10">
            <div className="w-24 h-24 rounded-full glass border-white/10 flex items-center justify-center text-4xl mb-8 animate-float">
              {searchQuery ? "🕵️" : "🚚"}
            </div>
            <h3 className="text-2xl font-display font-black text-white mb-2">
              {searchQuery ? "No Results Found" : "System Archive Empty"}
            </h3>
            <p className="text-slate-500 font-display font-bold max-w-md text-center mb-8">
              {searchQuery ? "Modify your search parameters or check the filter alignment." : "Initialize your first logistic mission to populate the control grid."}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/trips/new')} className="!px-10 !py-5 !bg-cyan-500 shadow-glow">
                ➕ Create Mission
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in mb-20">
            <div className="grid grid-cols-1 gap-8">
              {paginatedTrips.map((trip, idx) => (
                <div key={trip.id} className="animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <TripCard
                    trip={trip}
                    onDelete={() => handleDeleteTrip(trip.id)}
                    onStatusChange={(status) => handleStatusChange(trip.id, status)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 pt-12 border-t border-white/5">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-16 h-16 rounded-full glass border-white/5 flex items-center justify-center disabled:opacity-20 hover:border-cyan-500 transition-all text-xl"
                >
                  ←
                </button>

                <div className="flex gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-2xl font-display font-black text-xs transition-all duration-500 ${currentPage === page
                        ? 'bg-cyan-500 text-slate-950 shadow-glow scale-110'
                        : 'glass border-white/5 text-slate-500 hover:text-white'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-16 h-16 rounded-full glass border-white/5 flex items-center justify-center disabled:opacity-20 hover:border-cyan-500 transition-all text-xl"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Mission Termination"
        size="sm"
      >
        <div className="p-4 space-y-8 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-float">
            ⚠️
          </div>
          <p className="text-slate-400 font-display font-bold text-lg leading-relaxed">
            Confirm mission data deletion. This action will permanently remove all flight records.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={confirmDelete}
              className="!w-full !py-5 !bg-rose-500 hover:!bg-rose-600 shadow-glow"
            >
              Terminate Record
            </Button>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="w-full py-4 text-[10px] font-display font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
            >
              Abort Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, color = "text-white" }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="glass-card p-6 md:p-8 flex flex-col justify-between group overflow-hidden relative">
      <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:scale-[3] transition-transform duration-1000"></div>
      <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest leading-none pt-0.5">{label}</p>
      <p className={`text-4xl font-display font-black ${color} tracking-tighter mt-4 leading-none`}>
        {value}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950">
        <div className="w-24 h-24 rounded-full border-t-2 border-cyan-500 animate-spin mb-8"></div>
        <p className="font-display font-black text-white uppercase tracking-[0.5em] animate-pulse">Initializing System...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
