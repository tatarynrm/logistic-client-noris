'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { LocationSuggestion, LocationPoint } from '@/types';
import { formatLocationName } from '@/lib/location';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TripFormData {
  load_date: string;
  unload_date: string;
  load_points: LocationPoint[];
  unload_points: LocationPoint[];
  driver_name: string;
  driver_phone: string;
  vehicle_info: string;
  owner_name: string;
  owner_phone: string;
  client_name: string;
  client_phone: string;
  client_payment: string;
  my_margin: string;
  margin_payer: 'client' | 'owner';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface TripFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TripFormData>;
  onSubmit: (data: TripFormData) => Promise<void>;
  tripId?: string; // Edit mode — used for map URL
}

// ─── Initial state helper ────────────────────────────────────────────────────

const defaultFormData = (): TripFormData => ({
  load_date: '',
  unload_date: '',
  load_points: [],
  unload_points: [],
  driver_name: '',
  driver_phone: '',
  vehicle_info: '',
  owner_name: '',
  owner_phone: '',
  client_name: '',
  client_phone: '',
  client_payment: '',
  my_margin: '',
  margin_payer: 'client',
  status: 'PENDING',
});

// ─── Custom hook: location autocomplete ─────────────────────────────────────

function useLocationSearch() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`
        );
        setSuggestions(await res.json());
      } catch { /* silent */ }
    }, 400);
  }, []);

  const clear = useCallback(() => { setQuery(''); setSuggestions([]); }, []);

  return { query, suggestions, search, clear };
}

// ─── Custom hook: fetch history for autocomplete ────────────────────────────

function useHistorySuggestions() {
  const [history, setHistory] = useState<{
    drivers: string[];
    vehicles: string[];
    owners: string[];
    clients: string[];
    phones: string[];
  }>({
    drivers: [],
    vehicles: [],
    owners: [],
    clients: [],
    phones: [],
  });

  useEffect(() => {
    fetch('/api/trips')
      .then(res => res.json())
      .then(data => {
        const trips = data.trips || [];
        const unique = (arr: any[]) => Array.from(new Set(arr.filter(Boolean)));

        setHistory({
          drivers: unique(trips.map((t: any) => t.driver_name)),
          vehicles: unique(trips.map((t: any) => t.vehicle_info)),
          owners: unique(trips.map((t: any) => t.owner_name)),
          clients: unique(trips.map((t: any) => t.client_name)),
          phones: unique([
            ...trips.map((t: any) => t.driver_phone),
            ...trips.map((t: any) => t.owner_phone),
            ...trips.map((t: any) => t.client_phone),
          ]),
        });
      })
      .catch(() => { });
  }, []);

  return history;
}

// ─── Sub-component: Location section card ───────────────────────────────────

interface LocationSectionProps {
  type: 'load' | 'unload';
  date: string;
  onDateChange: (v: string) => void;
  points: LocationPoint[];
  onAddPoint: (loc: LocationSuggestion) => void;
  onRemovePoint: (i: number) => void;
  pointError?: string;
  dateError?: string;
}

function LocationSection({
  type,
  date,
  onDateChange,
  points,
  onAddPoint,
  onRemovePoint,
  pointError,
  dateError,
}: LocationSectionProps) {
  const isLoad = type === 'load';
  const { query, suggestions, search, clear } = useLocationSearch();

  const accent = isLoad
    ? { ring: 'focus:ring-blue-500/30 focus:border-blue-500', dot: 'bg-blue-500', icon: '🗓️', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', search: 'group-focus-within:text-blue-500' }
    : { ring: 'focus:ring-emerald-500/30 focus:border-emerald-500', dot: 'bg-emerald-500', icon: '🏁', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', search: 'group-focus-within:text-emerald-500' };

  const handleSelect = (loc: LocationSuggestion) => {
    onAddPoint(loc);
    clear();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2rem] p-7 shadow-sm flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl ${accent.badge} flex items-center justify-center text-xl flex-shrink-0`}>
          {accent.icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isLoad ? 'Відправлення' : 'Доставка'}
          </p>
          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
            {isLoad ? 'Завантаження' : 'Розвантаження'}
          </h3>
        </div>
      </div>

      {/* Date input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {isLoad ? 'Дата та час завантаження' : 'Дата та час розвантаження'}
          {isLoad && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          onClick={(e) => (e.currentTarget as HTMLInputElement).showPicker?.()}
          required={isLoad}
          className={`w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950/40 border ${dateError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all font-medium text-sm cursor-pointer ${accent.ring}`}
        />
        {dateError && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{dateError}</p>}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/50" />

      {/* Location search */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          📍 {isLoad ? 'Точки завантаження' : 'Точки вивантаження'}
        </label>

        <div className="relative group">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors ${accent.search}`}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Почніть вводити місто або адресу..."
            value={query}
            onChange={(e) => search(e.target.value)}
            className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950/40 border ${pointError ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm ${accent.ring}`}
          />
          {pointError && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{pointError}</p>}

          {/* Dropdown suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-[200] w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
              {suggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{formatLocationName(loc)}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{loc.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected points */}
        {points.length > 0 && (
          <div className="flex flex-col gap-2 mt-1">
            {points.map((point, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm group/point"
              >
                <div className={`w-6 h-6 rounded-full ${accent.dot} text-white flex items-center justify-center text-[10px] font-black flex-shrink-0`}>
                  {idx + 1}
                </div>
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 font-semibold truncate">
                  {point.displayName}
                </span>
                <button
                  type="button"
                  onClick={() => onRemovePoint(idx)}
                  className="opacity-0 group-hover/point:opacity-100 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-all rounded-xl"
                  aria-label="Видалити точку"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {points.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-2 italic">
            Жодної точки не додано
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component: Section label ────────────────────────────────────────────

function SectionLabel({ icon, label, accent = false }: { icon: string; label: string; accent?: boolean }) {
  return (
    <p className={`text-[10px] font-extrabold uppercase tracking-widest border-l-2 pl-3 ${accent
      ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
      : 'border-slate-300 dark:border-slate-700 text-slate-400'
      }`}>
      {icon} {label}
    </p>
  );
}

// ─── Main TripForm component ─────────────────────────────────────────────────

export default function TripForm({ mode, initialData, onSubmit, tripId }: TripFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TripFormData>(() => ({
    ...defaultFormData(),
    ...initialData,
  }));

  const history = useHistorySuggestions();

  // Sync initialData once it arrives (for edit mode async load)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const update = useCallback(<K extends keyof TripFormData>(field: K, value: TripFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when updated
    if (errors[field as string]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  }, [errors]);

  const addPoint = useCallback((type: 'load' | 'unload', loc: LocationSuggestion) => {
    const pt: LocationPoint = {
      name: loc.display_name,
      lat: parseFloat(loc.lat),
      lng: parseFloat(loc.lon),
      displayName: formatLocationName(loc),
    };
    setFormData((prev) => ({
      ...prev,
      [type === 'load' ? 'load_points' : 'unload_points']: [
        ...(type === 'load' ? prev.load_points : prev.unload_points),
        pt,
      ],
    }));
    // Clear point-related error
    const key = type === 'load' ? 'load_points' : 'unload_points';
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }, [errors]);

  const removePoint = useCallback((type: 'load' | 'unload', idx: number) => {
    const key = type === 'load' ? 'load_points' : 'unload_points';
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== idx),
    }));
  }, []);

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (formData.load_points.length === 0) errs.load_points = 'Додайте хоча б одну точку завантаження';
    if (formData.unload_points.length === 0) errs.unload_points = 'Додайте хоча б одну точку вивантаження';
    if (!formData.load_date) errs.load_date = 'Вкажіть дату завантаження';
    if (!formData.driver_name.trim()) errs.driver_name = "Вкажіть ім'я водія";
    if (!formData.driver_phone.trim()) errs.driver_phone = "Вкажіть телефон водія";
    if (!formData.client_name.trim()) errs.client_name = "Вкажіть ім'я замовника";
    if (!formData.vehicle_info.trim()) errs.vehicle_info = 'Вкажіть дані автомобіля';
    if (!formData.client_payment.trim()) errs.client_payment = 'Вкажіть оплату';
    if (!formData.my_margin.trim()) errs.my_margin = 'Вкажіть маржу';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrorKey = Object.keys(errs)[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});
    setSubmitting(true);

    // Normalize financial data (replace comma with dot for API)
    const preparedData = {
      ...formData,
      client_payment: formData.client_payment.replace(',', '.'),
      my_margin: formData.my_margin.replace(',', '.'),
    };

    try {
      await onSubmit(preparedData);
    } finally {
      setSubmitting(false);
    }
  };

  const openMap = () => {
    const all = [...formData.load_points, ...formData.unload_points];
    if (all.length < 2) return;
    const route = all.map((p) => `${p.lat},${p.lng}`).join(';');
    window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}`, '_blank');
  };

  const hasRouteForMap = formData.load_points.length > 0 && formData.unload_points.length > 0;

  const statusConfig = [
    { value: 'PENDING', label: 'Очікую', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { value: 'IN_PROGRESS', label: 'В процесі', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { value: 'COMPLETED', label: 'Завершено', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { value: 'CANCELLED', label: 'Скасовано', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  ] as const;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

      {/* ── ROW 1: Route (Load + Unload side by side) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocationSection
          type="load"
          date={formData.load_date}
          onDateChange={(v) => update('load_date', v)}
          points={formData.load_points}
          onAddPoint={(loc) => addPoint('load', loc)}
          onRemovePoint={(i) => removePoint('load', i)}
          pointError={errors.load_points}
          dateError={errors.load_date}
        />
        <LocationSection
          type="unload"
          date={formData.unload_date}
          onDateChange={(v) => update('unload_date', v)}
          points={formData.unload_points}
          onAddPoint={(loc) => addPoint('unload', loc)}
          onRemovePoint={(i) => removePoint('unload', i)}
          pointError={errors.unload_points}
          dateError={errors.unload_date}
        />
      </div>

      {/* ── ROW 2: Participants + Financial panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Participants (2/3) */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] p-7 shadow-sm flex flex-col gap-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">🚛</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Логістика</p>
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">Транспорт та Сторони</h3>
            </div>
          </div>

          {/* Driver */}
          <div className="p-5 bg-slate-50/60 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Керування</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Дані водія</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ім'я водія" required name="driver_name" value={formData.driver_name} onChange={(v) => update('driver_name', v)} list="drivers-list" error={errors.driver_name} />
              <Field label="Телефон водія" type="tel" required name="driver_phone" value={formData.driver_phone} onChange={(v) => update('driver_phone', v)} list="phones-list" error={errors.driver_phone} />
            </div>
          </div>

          {/* Vehicle */}
          <Field
            label="Дані автомобіля"
            placeholder="Марка, номер тягача / причепа"
            required
            name="vehicle_info"
            value={formData.vehicle_info}
            onChange={(v) => update('vehicle_info', v)}
            list="vehicles-list"
            error={errors.vehicle_info}
          />

          {/* Owner */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="🏢" label="Перевізник (Власник)" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ім'я власника" name="owner_name" value={formData.owner_name} onChange={(v) => update('owner_name', v)} list="owners-list" error={errors.owner_name} />
              <Field label="Телефон власника" type="tel" name="owner_phone" value={formData.owner_phone} onChange={(v) => update('owner_phone', v)} list="phones-list" error={errors.owner_phone} />
            </div>
          </div>

          {/* Client */}
          <div className="flex flex-col gap-3">
            <SectionLabel icon="🤝" label="Замовник рейсу" accent />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ім'я замовника" required name="client_name" value={formData.client_name} onChange={(v) => update('client_name', v)} list="clients-list" error={errors.client_name} />
              <Field label="Телефон замовника" type="tel" name="client_phone" value={formData.client_phone} onChange={(v) => update('client_phone', v)} list="phones-list" error={errors.client_phone} />
            </div>
          </div>

          {/* Datalists for Autocomplete */}
          <datalist id="drivers-list">{history.drivers.map(d => <option key={d} value={d} />)}</datalist>
          <datalist id="vehicles-list">{history.vehicles.map(v => <option key={v} value={v} />)}</datalist>
          <datalist id="owners-list">{history.owners.map(o => <option key={o} value={o} />)}</datalist>
          <datalist id="clients-list">{history.clients.map(c => <option key={c} value={c} />)}</datalist>
          <datalist id="phones-list">{history.phones.map(p => <option key={p} value={p} />)}</datalist>
        </div>

        {/* Right: Financial panel (1/3) */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-[2rem] p-7 text-white shadow-2xl relative overflow-hidden flex flex-col gap-6">
          {/* Ambient glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">💰</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Фінанси</p>
              <h3 className="text-base font-bold text-white leading-tight">Оплата та маржа</h3>
            </div>
          </div>

          {/* Margin payer toggle */}
          <div className="relative z-10 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Хто платить маржу? <span className="text-rose-400">*</span>
            </label>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
              {(['client', 'owner'] as const).map((payer) => (
                <button
                  key={payer}
                  type="button"
                  onClick={() => update('margin_payer', payer)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200 ${formData.margin_payer === payer
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {payer === 'client' ? 'Замовник' : 'Власник'}
                </button>
              ))}
            </div>
          </div>

          {/* Amount inputs */}
          <div className="relative z-10 flex flex-col gap-4">
            <AmountField
              label="Оплата замовника"
              name="client_payment"
              value={formData.client_payment}
              onChange={(v) => update('client_payment', v)}
              color="text-white"
              hoverBorder="hover:border-blue-500/50"
              error={errors.client_payment}
            />
            <AmountField
              label="Ваша маржа"
              name="my_margin"
              value={formData.my_margin}
              onChange={(v) => update('my_margin', v)}
              color="text-emerald-400"
              hoverBorder="hover:border-emerald-500/50"
              error={errors.my_margin}
            />
          </div>

          {/* Status selector */}
          <div className="relative z-10 border-t border-white/10 pt-5 flex flex-col gap-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Статус рейсу</label>
            <div className="grid grid-cols-2 gap-2">
              {statusConfig.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('status', s.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 ${formData.status === s.value
                    ? `${s.color} scale-[1.03] shadow-md`
                    : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20 hover:text-slate-300'
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Map link (edit mode if route present) */}
          {isEdit && hasRouteForMap && (
            <button
              type="button"
              onClick={openMap}
              className="relative z-10 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              🗺️ Переглянути маршрут
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="relative z-10 mt-auto w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-sm uppercase tracking-widest hover:bg-slate-100 active:scale-[0.98] transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting
              ? (isEdit ? 'Збереження...' : 'Реєстрація...')
              : (isEdit ? 'Зберегти зміни' : 'Зареєструвати рейс')}
          </button>
        </div>

        {/* API Errors */}
        {errors.api && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl p-5">
            <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{errors.api}</p>
          </div>
        )}
      </div>
    </form>
  );
}

// ─── Micro components ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  list?: string;
  error?: string;
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required, list, error }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}{required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        autoComplete="on"
        list={list}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full px-5 py-3.5 bg-white dark:bg-slate-950/30 border ${error ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'} rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-sm`}
      />
      {error && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">{error}</p>}
    </div>
  );
}

interface AmountFieldProps {
  label: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  color: string;
  hoverBorder: string;
  error?: string;
}

function AmountField({ label, name, value, onChange, color, hoverBorder, error }: AmountFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace('.', ',');
    // Allow only digits and one comma
    if (/^[0-9]*,?[0-9]*$/.test(val) || val === '') {
      onChange(val);
    }
  };

  return (
    <div className={`bg-white/5 rounded-2xl p-4 border ${error ? 'border-rose-500' : 'border-white/10'} transition-colors ${hoverBorder}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{label}</p>
      <input
        type="text"
        name={name}
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        className={`w-full bg-transparent text-3xl font-black ${color} focus:outline-none placeholder-white/20`}
        placeholder="0,00"
      />
      {error && <p className="text-[10px] font-bold text-rose-400 mt-2">{error}</p>}
    </div>
  );
}
