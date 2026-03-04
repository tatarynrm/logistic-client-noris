'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Navigation from '@/components/Navigation';
import StatusBadge from '@/components/StatusBadge';
import { Trip, LocationPoint } from '@/types';

import Skeleton from '@/components/Skeleton';
import EmptyState from '@/components/EmptyState';

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
        <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-8 mb-10">
          <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2 bg-blue-500/10 rounded-xl text-blue-500">📅</span> Оберіть період
          </h2>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={setCurrentMonth}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
            >
              Поточний місяць
            </button>
            <button
              onClick={setLastMonth}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
            >
              Минулий місяць
            </button>
            <button
              onClick={setCurrentYear}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
            >
              Поточний рік
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата початку</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Дата кінця</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-5 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {loading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 p-8 transition-all hover:shadow-xl hover:-translate-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Всього рейсів</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{summary.tripCount}</p>
                  <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">рейсів</span>
                </div>
              </div>

              <div className="bg-blue-600 rounded-[2.5rem] shadow-glow border-none p-8 transition-all hover:shadow-2xl hover:-translate-y-1 text-white relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">Оплата замовників</p>
                <p className="text-4xl font-black relative z-10 tracking-tight">
                  {summary.totalPayment.toLocaleString('uk-UA')} <span className="text-sm font-bold opacity-60">грн</span>
                </p>
              </div>

              <div className="bg-violet-600 rounded-[2.5rem] shadow-glow-violet border-none p-8 transition-all hover:shadow-2xl hover:-translate-y-1 text-white relative overflow-hidden group">
                <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-3">Чиста маржа</p>
                <p className="text-4xl font-black relative z-10 tracking-tight">
                  {summary.totalMargin.toLocaleString('uk-UA')} <span className="text-sm font-bold opacity-60">грн</span>
                </p>
              </div>
            </>
          )}
        </div>

        {loading ? (
          <Skeleton className="h-[600px] rounded-[2.5rem]" />
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title={searchQuery ? "Нічого не знайдено" : "Звіт порожній"}
            description={searchQuery ? "Перевірте параметри пошуку." : "За обраний період рейсів не знайдено. Спробуйте змінити дати."}
            icon="📊"
          />
        ) : (
          <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800/60 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex-1 w-full relative group">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
                <input
                  type="text"
                  placeholder="Швидкий фільтр у звіті..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-950/30">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Дата</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Маршрут</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Деталі</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Статус</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Оплата</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Маржа</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {paginatedTrips.map(trip => {
                    const loadPoints = (trip.load_points as unknown as LocationPoint[]) || [];
                    const unloadPoints = (trip.unload_points as unknown as LocationPoint[]) || [];
                    const routeDisplay = loadPoints.length === 1 && unloadPoints.length === 1
                      ? `${loadPoints[0].displayName} → ${unloadPoints[0].displayName}`
                      : `${loadPoints.length} точок → ${unloadPoints.length} точок`;

                    return (
                      <tr key={trip.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                        <td className="px-8 py-6 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap font-bold">
                          {formatDate(trip.load_date)}
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-slate-900 dark:text-white mb-1">{routeDisplay}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest line-clamp-1 opacity-60">
                            {loadPoints[0]?.displayName}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{trip.driver_name}</div>
                          <div className="text-[10px] text-slate-400 font-black">{trip.vehicle_info || trip.driver_phone}</div>
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={trip.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="text-sm font-black text-slate-900 dark:text-white">{trip.client_payment.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-400 font-bold">грн</div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-black">
                            {trip.my_margin.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-8 border-top border-slate-100 dark:border-slate-800 flex justify-center items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                >
                  ←
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-2xl font-black text-xs transition-all ${currentPage === page
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-100 dark:border-slate-700'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function EarningsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4"></div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">Аналітика...</p>
      </div>
    }>
      <EarningsContent />
    </Suspense>
  );
}
