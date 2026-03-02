'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Navigation from '@/components/Navigation';
import StatusBadge from '@/components/StatusBadge';
import { Trip, LocationPoint } from '@/types';

const ITEMS_PER_PAGE = 20;

function EarningsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<any>(null);
  const [summary, setSummary] = useState({ 
    totalMargin: 0, 
    totalPayment: 0,
    tripCount: 0 
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  useEffect(() => {
    loadUser();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

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

  useEffect(() => {
    if (startDate && endDate) {
      loadEarnings();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    updateURL();
  }, [searchQuery, currentPage]);

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newURL = params.toString() ? `?${params.toString()}` : '/earnings';
    window.history.replaceState({}, '', newURL);
  };

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/earnings?startDate=${startDate}&endDate=${endDate}`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Помилка завантаження даних');
    } finally {
      setLoading(false);
    }
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const setCurrentYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    lastDay.setHours(23, 59, 59, 999);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    lastDay.setHours(23, 59, 59, 999);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
      (trip.owner_name && trip.owner_name.toLowerCase().includes(lowerQuery)) ||
      (trip.owner_phone && trip.owner_phone.includes(lowerQuery)) ||
      (trip.vehicle_info && trip.vehicle_info.toLowerCase().includes(lowerQuery)) ||
      (trip.client_phone && trip.client_phone.includes(lowerQuery)) ||
      trip.client_payment.toString().includes(lowerQuery) ||
      trip.my_margin.toString().includes(lowerQuery)
    );
  };

  const filteredTrips = trips.filter(trip => {
    return !searchQuery || searchInTrip(trip, searchQuery);
  });

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTrips = filteredTrips.slice(startIndex, endIndex);

  if (!user) {
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Оберіть період
          </h2>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <Button variant="secondary" onClick={setCurrentMonth}>
              Поточний місяць
            </Button>
            <Button variant="secondary" onClick={setLastMonth}>
              Минулий місяць
            </Button>
            <Button variant="secondary" onClick={setCurrentYear}>
              Поточний рік
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Від"
              type="date"
              value={startDate}
              onChange={setStartDate}
            />
            <Input
              label="До"
              type="date"
              value={endDate}
              onChange={setEndDate}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Завантаження...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Кількість рейсів</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                  {summary.tripCount}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6">
                <p className="text-sm text-blue-100 mb-2">Оплата замовників</p>
                <p className="text-4xl font-bold text-white">
                  {summary.totalPayment.toFixed(0)} грн
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6">
                <p className="text-sm text-green-100 mb-2">Моя маржа</p>
                <p className="text-4xl font-bold text-white">
                  {summary.totalMargin.toFixed(0)} грн
                </p>
              </div>
            </div>

            {trips.length > 0 && (
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
            )}

            {filteredTrips.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'Нічого не знайдено за вашим запитом' : 'Немає рейсів за обраний період'}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Дата завантаження
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Маршрут
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Водій
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Статус
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Оплата замовника
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Маржа
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Платить маржу
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedTrips.map(trip => {
                          const loadPoints = trip.load_points as unknown as LocationPoint[];
                          const unloadPoints = trip.unload_points as unknown as LocationPoint[];
                          const routeDisplay = loadPoints.length === 1 && unloadPoints.length === 1
                            ? `${loadPoints[0].displayName} → ${unloadPoints[0].displayName}`
                            : `${loadPoints.length} точок → ${unloadPoints.length} точок`;
                          
                          return (
                          <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                              {formatDate(trip.load_date)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              <div className="font-medium">{routeDisplay}</div>
                              {trip.unload_date && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Вигрузка: {formatDate(trip.unload_date)}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              <div>{trip.driver_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{trip.driver_phone}</div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <StatusBadge status={trip.status} />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right font-medium">
                              {trip.client_payment} грн
                            </td>
                            <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 text-right font-bold">
                              {trip.my_margin} грн
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                              {trip.margin_payer === 'client' ? 'Замовник' : 'Перевізник'}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
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
          </>
        )}
      </main>
    </div>
  );
}


export default function EarningsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Завантаження...</div>
      </div>
    }>
      <EarningsContent />
    </Suspense>
  );
}
