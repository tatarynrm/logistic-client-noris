'use client';

import { Trip, LocationPoint } from '@/types';
import Button from './Button';
import StatusBadge from './StatusBadge';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Modal from './Modal';

interface TripCardProps {
  trip: Trip;
  onDelete: () => void;
  onStatusChange: (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => void;
}

const STATUS_META: Record<string, { strip: string; glow: string }> = {
  COMPLETED:   { strip: 'from-emerald-400 to-teal-500',   glow: 'hover:shadow-emerald-500/10' },
  IN_PROGRESS: { strip: 'from-blue-400 to-indigo-500',    glow: 'hover:shadow-blue-500/10'   },
  CANCELLED:   { strip: 'from-rose-400 to-red-500',       glow: 'hover:shadow-rose-500/10'   },
  PENDING:     { strip: 'from-amber-400 to-orange-400',   glow: 'hover:shadow-amber-500/10'  },
};

export default function TripCard({ trip, onDelete, onStatusChange }: TripCardProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const load   = trip.load_points   as unknown as LocationPoint[];
  const unload = trip.unload_points as unknown as LocationPoint[];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });

  const formatDateFull = (d: string) =>
    new Date(d).toLocaleString('uk-UA', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const route = [...load, ...unload].map(p => p.displayName).join(' → ') || '—';

  const openMap = () => {
    const pts = [...load, ...unload];
    if (pts.length < 2) return;
    window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${pts.map(p => `${p.lat},${p.lng}`).join(';')}`, '_blank');
  };

  const meta = STATUS_META[trip.status] ?? STATUS_META.PENDING;
  const isClient = trip.margin_payer === 'CLIENT';

  return (
    <>
      <article className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${meta.glow}`}>

        {/* Status strip */}
        <div className={`h-0.5 w-full bg-gradient-to-r ${meta.strip}`} />

        {/* ── Header ── */}
        <div className="px-4 py-3 flex items-start gap-3 justify-between">
          <div className="flex-1 min-w-0">
            {/* Route */}
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug truncate">
              {route}
            </p>
            {/* Dates */}
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {formatDate(trip.load_date)}
                {trip.unload_date && ` → ${formatDate(trip.unload_date)}`}
              </span>
              {load.length > 1   && <Tag color="blue">{load.length} t(load)</Tag>}
              {unload.length > 1 && <Tag color="emerald">{unload.length} t(unload)</Tag>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <StatusBadge status={trip.status} onChange={onStatusChange} editable />
            <Btn onClick={() => setDetailsOpen(true)} title="Деталі">ℹ️</Btn>
            <Btn onClick={openMap} title="Карта" disabled={load.length === 0 || unload.length === 0}>🗺️</Btn>
            <Btn onClick={() => router.push(`/trips/${trip.id}/edit`)} title="Редагувати">✏️</Btn>
            <Btn onClick={onDelete} title="Видалити" className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">🗑️</Btn>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="px-4 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 border-t border-slate-100 dark:border-slate-800/80 pt-3">

          <Cell label="Водій" icon="👤" iconClass="bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400">
            <Line bold>{trip.driver_name}</Line>
            <Line muted>{trip.driver_phone}</Line>
          </Cell>

          <Cell label="Транспорт" icon="🚛" iconClass="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Line bold>{trip.vehicle_info || '—'}</Line>
            {trip.owner_name && <Line muted>{trip.owner_name}</Line>}
          </Cell>

          <Cell label="Замовник" icon="🤝" iconClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <Line bold>{trip.client_name}</Line>
            {trip.client_phone && <Line muted>{trip.client_phone}</Line>}
          </Cell>

          {/* Finances */}
          <div className="flex flex-col gap-1">
            <Label>Фінанси</Label>
            <div className="flex flex-col gap-1 mt-0.5">
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Оплата</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{trip.client_payment}<span className="text-[10px] font-normal ml-0.5 text-slate-400">грн</span></span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">Маржа</span>
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">{trip.my_margin}<span className="text-[10px] font-normal ml-0.5 text-emerald-400/60">грн</span></span>
              </div>
              <div className="flex items-center justify-end mt-0.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isClient
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {isClient ? '🤝 замовник' : '🚛 власник'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </article>

      {/* ── Details Modal ── */}
      <Modal isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="Деталі рейсу" size="lg">
        <div className="space-y-4">

          <ModalBlock icon="📅" title="Дати">
            <MRow label="Завантаження" value={formatDateFull(trip.load_date)} />
            {trip.unload_date && <MRow label="Вигрузка" value={formatDateFull(trip.unload_date)} />}
          </ModalBlock>

          <ModalBlock icon="📍" title="Маршрут">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-blue-50 dark:bg-blue-900/15 rounded-xl p-3">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1.5">Завантаження</p>
                {load.map((p, i) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 font-medium">{i+1}. {p.displayName}</p>)}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/15 rounded-xl p-3">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Вигрузка</p>
                {unload.map((p, i) => <p key={i} className="text-xs text-slate-600 dark:text-slate-300 font-medium">{i+1}. {p.displayName}</p>)}
              </div>
            </div>
          </ModalBlock>

          <ModalBlock icon="🚗" title="Водій та транспорт">
            <MRow label="Водій"     value={trip.driver_name} />
            <MRow label="Телефон"   value={trip.driver_phone} />
            <MRow label="Транспорт" value={trip.vehicle_info} />
          </ModalBlock>

          {(trip.owner_name || trip.owner_phone) && (
            <ModalBlock icon="🏢" title="Перевізник">
              {trip.owner_name  && <MRow label="Ім'я"    value={trip.owner_name} />}
              {trip.owner_phone && <MRow label="Телефон" value={trip.owner_phone} />}
            </ModalBlock>
          )}

          <ModalBlock icon="🤝" title="Замовник">
            <MRow label="Ім'я"    value={trip.client_name} />
            {trip.client_phone && <MRow label="Телефон" value={trip.client_phone} />}
          </ModalBlock>

          <ModalBlock icon="💰" title="Фінанси">
            <MRow label="Оплата"        value={`${trip.client_payment} грн`} />
            <MRow label="Маржа"         value={`${trip.my_margin} грн`} accent="emerald" />
            <MRow label="Платить маржу" value={isClient ? '🤝 Замовник' : '🚛 Власник'} accent={isClient ? 'blue' : undefined} />
          </ModalBlock>

          <ModalBlock icon="📊" title="Статус">
            <StatusBadge status={trip.status} onChange={onStatusChange} editable />
          </ModalBlock>

        </div>
      </Modal>
    </>
  );
}

// ── Primitives ────────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{children}</span>;
}

function Cell({ label, icon, iconClass, children }: { label: string; icon: string; iconClass: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex items-start gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${iconClass}`}>{icon}</div>
        <div className="min-w-0 flex flex-col gap-0.5 pt-0.5">{children}</div>
      </div>
    </div>
  );
}

function Line({ children, bold, muted }: { children: React.ReactNode; bold?: boolean; muted?: boolean }) {
  if (!children) return null;
  return (
    <p className={`truncate leading-snug ${bold ? 'text-[13px] font-semibold text-slate-800 dark:text-slate-100' : ''} ${muted ? 'text-[11px] text-slate-400 dark:text-slate-500' : ''}`}>
      {children}
    </p>
  );
}

function Tag({ color, children }: { color: 'blue' | 'emerald'; children: React.ReactNode }) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      color === 'blue'    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                         : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
    }`}>{children}</span>
  );
}

function Btn({ children, onClick, title, disabled, className = '' }: {
  children: React.ReactNode; onClick?: () => void; title?: string; disabled?: boolean; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function ModalBlock({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">{children}</div>
    </div>
  );
}

function MRow({ label, value, accent }: { label: string; value: string; accent?: 'emerald' | 'blue' }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-right ${
        accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
        accent === 'blue'    ? 'text-blue-600 dark:text-blue-400' :
                               'text-slate-700 dark:text-slate-200'
      }`}>{value}</span>
    </div>
  );
}
