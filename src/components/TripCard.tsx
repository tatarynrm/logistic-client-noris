'use client';

import { Trip, LocationPoint } from '@/types';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from './Modal';

// - [x] Create implementation plan <!-- id: 2 -->
// - [/] Refactor TripCard component for compactness <!-- id: 3 -->

interface TripCardProps {
  trip: Trip;
  onDelete: () => void;
  onStatusChange: (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => void;
}

const STATUS_META: Record<string, { bg: string; text: string; shadow: string }> = {
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', shadow: 'shadow-emerald-500/10' },
  IN_PROGRESS: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', shadow: 'shadow-cyan-500/10' },
  CANCELLED: { bg: 'bg-rose-500/10', text: 'text-rose-500', shadow: 'shadow-rose-500/10' },
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-500', shadow: 'shadow-amber-500/10' },
};

export default function TripCard({ trip, onDelete, onStatusChange }: TripCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`trip-expanded-${trip.id}`) === 'true';
    }
    return false;
  });
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const toggleExpanded = () => {
    const nextValue = !isExpanded;
    setIsExpanded(nextValue);
    localStorage.setItem(`trip-expanded-${trip.id}`, String(nextValue));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const load = trip.load_points as unknown as LocationPoint[];
  const unload = trip.unload_points as unknown as LocationPoint[];

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const diff = (target - today) / (1000 * 60 * 60 * 24);

    const baseDate = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });

    if (diff === 0) return `Сьогодні, ${baseDate}`;
    if (diff === 1) return `Завтра, ${baseDate}`;
    if (diff === -1) return `Вчора, ${baseDate}`;

    return baseDate;
  };

  const formatDateFull = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleString('uk-UA', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const route = [...load, ...unload].map(p => p.displayName).join(' → ') || '—';

  const openMap = () => {
    const pts = [...load, ...unload];
    if (pts.length < 2) return;
    window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pts.map(p => `${p.lat},${p.lng}`).join(';')}`, '_blank');
  };

  const meta = STATUS_META[trip.status] ?? STATUS_META.PENDING;
  const isClient = trip.margin_payer === 'CLIENT';

  const handleShareSummary = () => {
    const summary = `🚚 РЕЙС #${trip.id.slice(0, 8)}\n📍 ${route}\n📅 ${formatDateFull(trip.load_date)}\n👤 Водій: ${trip.driver_name} (${trip.driver_phone})\n🚛 ТЗ: ${trip.vehicle_info || '—'}`;
    handleCopy(summary, 'Звіт скопійовано');
  };

  return (
    <article className="max-w-6xl mx-auto w-full glass-card group relative p-0 overflow-hidden hover:border-cyan-500/50 transition-all duration-700">
      <div className={`absolute top-0 right-0 w-32 h-32 ${meta.bg} blur-[60px] opacity-20 pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>

      {/* Copy Feedback Toast */}
      {copyFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-display font-black uppercase tracking-widest shadow-glow animate-slide-up">
          {copyFeedback}
        </div>
      )}

      <div className="flex flex-col">
        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row items-stretch">

          {/* Status & Short Info Side */}
          <div className="lg:w-48 p-4 lg:p-6 flex lg:flex-col justify-between items-center border-b lg:border-b-0 lg:border-r border-slate-200/50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
            <div className="flex lg:flex-col items-center gap-3">
              <StatusBadge status={trip.status} onChange={onStatusChange} editable />
              <button
                onClick={() => handleCopy(trip.id, 'ID скопійовано')}
                className="group/id flex items-center gap-1.5 text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] lg:mt-3 hover:text-cyan-500 transition-colors"
              >
                #{trip.id.slice(0, 8)}
                <span className="opacity-0 group-hover/id:opacity-100 transition-opacity">📋</span>
              </button>
            </div>

            <div className="hidden lg:flex flex-col items-center gap-2 mt-auto">
              <div className="flex items-center gap-1">
                <Btn onClick={toggleExpanded} className={`!w-8 !h-8 ${isExpanded ? 'bg-cyan-500/10 border-cyan-500/50' : ''}`} title="Розгорнути деталі">
                  {isExpanded ? '🔼' : '🔽'}
                </Btn>
                <Btn onClick={openMap} className="!w-8 !h-8 text-xs" title="Відкрити карту">🗺️</Btn>
                <Btn onClick={handleShareSummary} className="!w-8 !h-8 text-xs" title="Копіювати звіт">📤</Btn>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <Btn onClick={toggleExpanded} className={`!w-10 !h-10 ${isExpanded ? 'bg-cyan-500/10 border-cyan-500/50' : ''}`}>
                {isExpanded ? '🔼' : '🔽'}
              </Btn>
              <Btn onClick={() => router.push(`/trips/${trip.id}/edit`)} className="!w-10 !h-10 text-xs">✏️</Btn>
            </div>
          </div>

          {/* Center Info - Operations Utility */}
          <div className="flex-1 p-4 lg:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-center">

            {/* Route Column */}
            <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base lg:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-cyan-500 transition-colors line-clamp-1" title={route}>
                  {route}
                </h3>
                <button
                  onClick={() => handleCopy(route, 'Маршрут скопійовано')}
                  className="text-[10px] opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-all"
                  title="Копіювати маршрут"
                >
                  📋
                </button>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span className="text-[10px] font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{formatDate(trip.load_date)}</span>
                <div className="w-4 h-[1px] bg-slate-200 dark:bg-white/10"></div>
                <span className="text-[10px] font-display font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{formatDate(trip.unload_date)}</span>
              </div>
            </div>

            {/* Participants Grid - Actionable */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 col-span-1 md:col-span-2">
              <div className="flex gap-3 items-start relative group/cell">
                <span className="text-sm mt-0.5 opacity-60">👤</span>
                <div>
                  <p className="text-xs font-display font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{trip.driver_name}</p>
                  <a href={`tel:${trip.driver_phone}`} className="text-[10px] text-cyan-500 font-bold tracking-tight hover:underline flex items-center gap-1">
                    {trip.driver_phone}
                    <span className="text-[8px]">📞</span>
                  </a>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-sm mt-0.5 opacity-60">🚛</span>
                <div>
                  <p className="text-xs font-display font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{trip.vehicle_info || '—'}</p>
                  {trip.owner_phone ? (
                    <a href={`tel:${trip.owner_phone}`} className="text-[10px] text-slate-500 font-medium hover:text-cyan-500 flex items-center gap-1 transition-colors">
                      {trip.owner_name || 'Власник'} <span className="text-[8px]">🔗</span>
                    </a>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">{trip.owner_name || 'Власний парк'}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-sm mt-0.5 opacity-60">🤝</span>
                <div>
                  <p className="text-xs font-display font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{trip.client_name}</p>
                  {trip.client_phone && (
                    <a href={`tel:${trip.client_phone}`} className="text-[10px] text-slate-500 font-medium hover:text-cyan-500 flex items-center gap-1 transition-colors uppercase tracking-tighter">
                      Контакт <span className="text-[8px]">📞</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center justify-end gap-1 px-2 border-l border-slate-200/50 dark:border-white/5">
                <Btn onClick={() => router.push(`/trips/${trip.id}/edit`)} className="!w-8 !h-8 text-[10px]" title="Редагувати">✏️</Btn>
                <Btn onClick={onDelete} className="!w-8 !h-8 text-[10px] text-rose-500 hover:bg-rose-500/10" title="Видалити">🗑️</Btn>
              </div>
            </div>
          </div>

          {/* Financials Strip */}
          <div className="lg:w-56 p-4 lg:p-6 bg-slate-900/5 dark:bg-white/5 flex flex-row lg:flex-col justify-between lg:justify-center items-center gap-4 lg:gap-2 border-t lg:border-t-0 lg:border-l border-slate-200/50 dark:border-white/5 text-right lg:text-center">
            <div className="space-y-0.5">
              <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Прибуток</p>
              <p className="text-xl lg:text-2xl font-display font-black text-emerald-500 tracking-tighter">
                {trip.my_margin} <span className="text-[10px] opacity-40 font-bold">грн</span>
              </p>
              <div className={`text-[8px] font-black uppercase tracking-widest ${isClient ? 'text-cyan-500/70' : 'text-emerald-500/70'} hidden lg:block`}>
                {isClient ? '⚡ Від замовника' : '🚛 Від власника'}
              </div>
            </div>

            <div className="hidden lg:block w-8 h-[1px] bg-slate-200 dark:bg-white/10 my-1 mx-auto"></div>

            <div className="space-y-0.5">
              <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Оплата</p>
              <p className="text-sm font-display font-black text-slate-900 dark:text-white tracking-tight">
                {trip.client_payment} <span className="text-[9px] opacity-40">грн</span>
              </p>
            </div>
          </div>
        </div>

        {/* Expandable Command Center */}
        {isExpanded && (
          <div className="p-4 bg-slate-950/90 backdrop-blur-3xl animate-fade-in border-t border-slate-200/50 dark:border-white/5">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Detailed Route & Timeline */}
                <div className="glass rounded-2xl p-5 border-white/5 relative overflow-hidden group/box">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Повний маршрут</p>
                    <button onClick={openMap} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors">
                      Карта маршруту 📍
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"><span className="text-sm">📅</span><p className="text-[9px] text-cyan-400 font-bold uppercase tracking-[0.2em]">Завантаження</p></div>
                      <p className="text-[11px] text-white font-black bg-cyan-500/10 px-2 py-1 rounded inline-block">{formatDateFull(trip.load_date)}</p>
                      <div className="space-y-1.5 pt-1">
                        {load.map((p, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-xs font-bold text-white leading-tight">{p.displayName}</span>
                            <span className="text-[9px] text-slate-500 font-medium">GPS: {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2"><span className="text-sm">🏁</span><p className="text-[9px] text-emerald-400 font-bold uppercase tracking-[0.2em]">Вигрузка</p></div>
                      <p className="text-[11px] text-white font-black bg-emerald-500/10 px-2 py-1 rounded inline-block">{formatDateFull(trip.unload_date)}</p>
                      <div className="space-y-1.5 pt-1">
                        {unload.map((p, i) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-xs font-bold text-white leading-tight">{p.displayName}</span>
                            <span className="text-[9px] text-slate-500 font-medium">GPS: {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Administrative Contacts & Controls */}
                <div className="glass rounded-2xl p-5 border-white/5 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-4">Екосистема контактів</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Водій</span>
                        <p className="text-xs text-white font-black">{trip.driver_name}</p>
                        <a href={`tel:${trip.driver_phone}`} className="text-[10px] text-cyan-400 font-bold hover:underline inline-flex items-center gap-1">
                          {trip.driver_phone} 📞
                        </a>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Власник ТЗ</span>
                        <p className="text-xs text-white font-black truncate">{trip.owner_name || 'Власний парк'}</p>
                        {trip.owner_phone ? (
                          <a href={`tel:${trip.owner_phone}`} className="text-[10px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1">
                            {trip.owner_phone} 📞
                          </a>
                        ) : <span className="text-[9px] text-slate-600 italic">Контакт відсутній</span>}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Замовник</span>
                        <p className="text-xs text-white font-black truncate">{trip.client_name}</p>
                        {trip.client_phone ? (
                          <a href={`tel:${trip.client_phone}`} className="text-[10px] text-amber-400 font-bold hover:underline inline-flex items-center gap-1">
                            {trip.client_phone} 📞
                          </a>
                        ) : <span className="text-[9px] text-slate-600 italic">Контакт відсутній</span>}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block">Автомобіль</span>
                        <p className="text-xs text-white font-black truncate">{trip.vehicle_info || 'Дані не вказано'}</p>
                        <span className="text-[9px] text-slate-600 uppercase font-black">System Verified ✅</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={handleShareSummary}
                        className="text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-slate-950 px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
                      >
                        Копіювати звіт 📋
                      </button>
                      <button
                        onClick={() => router.push(`/trips/${trip.id}/edit`)}
                        className="text-[10px] font-black uppercase tracking-widest bg-white/5 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Редагувати ✏️
                      </button>
                    </div>
                    <button onClick={toggleExpanded} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
                      Згорнути панель ▲
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function Btn({ children, onClick, className = '', title }: { children: React.ReactNode; onClick: () => void; className?: string; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg glass hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-300 active:scale-90 border-slate-200/50 dark:border-white/5 ${className}`}
    >
      {children}
    </button>
  );
}