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
    const loadPoints = trip.load_points as unknown as LocationPoint[];
    const unloadPoints = trip.unload_points as unknown as LocationPoint[];
    
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Всього</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow p-4">
            <p className="text-xs text-orange-700 dark:text-orange-400 uppercase">Очікую</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.pending}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-4">
            <p className="text-xs text-blue-700 dark:text-blue-400 uppercase">В процесі</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-4">
            <p className="text-xs text-green-700 dark:text-green-400 uppercase">Завершено</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-4">
            <p className="text-xs text-red-700 dark:text-red-400 uppercase">Скасовано</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.cancelled}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow p-4">
            <p className="text-xs text-purple-700 dark:text-purple-400 uppercase">Маржа</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalMargin} грн</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Пошук по всім полям..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
            {searchQuery && (
              <Button variant="secondary" onClick={() => handleSearchChange('')}>
                Очистити
              </Button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Знайдено: {filteredTrips.length} рейсів
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Всі рейси
            </button>
            <button
              onClick={() => handleFilterChange('PENDING')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === 'PENDING'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Очікую
            </button>
            <button
              onClick={() => handleFilterChange('IN_PROGRESS')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === 'IN_PROGRESS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              В процесі
            </button>
            <button
              onClick={() => handleFilterChange('COMPLETED')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === 'COMPLETED'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Завершено
            </button>
            <button
              onClick={() => handleFilterChange('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filter === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Скасовано
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Показувати:
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              {searchQuery 
                ? 'Нічого не знайдено за вашим запитом' 
                : filter === 'all' 
                  ? 'У вас ще немає рейсів' 
                  : 'Немає рейсів з таким статусом'}
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/trips/new')}>
                Створити перший рейс
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 mb-6">
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
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Назад
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперед →
                </Button>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Сторінка {currentPage} з {totalPages} • Показано {startIndex + 1}-{Math.min(endIndex, filteredTrips.length)} з {filteredTrips.length} рейсів
            </p>
          </>
        )}
      </main>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Підтвердження видалення"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Ви впевнені, що хочете видалити цей рейс? Цю дію неможливо скасувати.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              className="flex-1"
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
