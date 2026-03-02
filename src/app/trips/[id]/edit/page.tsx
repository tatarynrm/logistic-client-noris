'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Navigation from '@/components/Navigation';
import { Trip, LocationSuggestion, LocationPoint } from '@/types';
import { formatLocationName } from '@/lib/location';

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadSuggestions, setLoadSuggestions] = useState<LocationSuggestion[]>([]);
  const [unloadSuggestions, setUnloadSuggestions] = useState<LocationSuggestion[]>([]);
  const [loadSearchQuery, setLoadSearchQuery] = useState('');
  const [unloadSearchQuery, setUnloadSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    load_date: '',
    unload_date: '',
    load_points: [] as LocationPoint[],
    unload_points: [] as LocationPoint[],
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

  useEffect(() => {
    loadUser();
    loadTrip();
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

  const loadTrip = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        const trip = data.trips.find((t: Trip) => t.id === params.id);
        
        if (trip) {
          setFormData({
            load_date: trip.load_date.slice(0, 16),
            unload_date: trip.unload_date ? trip.unload_date.slice(0, 16) : '',
            load_points: trip.load_points as unknown as LocationPoint[],
            unload_points: trip.unload_points as unknown as LocationPoint[],
            driver_name: trip.driver_name,
            driver_phone: trip.driver_phone,
            vehicle_info: (trip as any).vehicle_info || '',
            owner_name: (trip as any).owner_name || '',
            owner_phone: (trip as any).owner_phone || '',
            client_name: trip.client_name,
            client_phone: (trip as any).client_phone || '',
            client_payment: trip.client_payment.toString(),
            my_margin: trip.my_margin.toString(),
            margin_payer: trip.margin_payer,
            status: trip.status,
          });
        }
      }
    } catch (error) {
      console.error('Помилка завантаження рейсу');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number | LocationPoint[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const searchLocation = async (query: string, type: 'load' | 'unload') => {
    if (query.length < 3) {
      type === 'load' ? setLoadSuggestions([]) : setUnloadSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`
      );
      const data = await res.json();
      type === 'load' ? setLoadSuggestions(data) : setUnloadSuggestions(data);
    } catch (error) {
      console.error('Помилка пошуку локації');
    }
  };

  const addLoadPoint = (location: LocationSuggestion) => {
    const displayName = formatLocationName(location);
    const newPoint: LocationPoint = {
      name: location.display_name,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      displayName,
    };
    updateField('load_points', [...formData.load_points, newPoint]);
    setLoadSearchQuery('');
    setLoadSuggestions([]);
  };

  const addUnloadPoint = (location: LocationSuggestion) => {
    const displayName = formatLocationName(location);
    const newPoint: LocationPoint = {
      name: location.display_name,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      displayName,
    };
    updateField('unload_points', [...formData.unload_points, newPoint]);
    setUnloadSearchQuery('');
    setUnloadSuggestions([]);
  };

  const removeLoadPoint = (index: number) => {
    updateField('load_points', formData.load_points.filter((_, i) => i !== index));
  };

  const removeUnloadPoint = (index: number) => {
    updateField('unload_points', formData.unload_points.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.load_points.length === 0) {
      alert('Додайте хоча б одну точку завантаження');
      return;
    }
    
    if (formData.unload_points.length === 0) {
      alert('Додайте хоча б одну точку вигрузки');
      return;
    }
    
    setSaving(true);

    try {
      const res = await fetch(`/api/trips/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Помилка оновлення рейсу');
      }
    } catch (error) {
      alert('Помилка з\'єднання');
    } finally {
      setSaving(false);
    }
  };

  const openMap = () => {
    const allPoints = [...formData.load_points, ...formData.unload_points];
    const route = allPoints.map(p => `${p.lat},${p.lng}`).join(';');
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}`;
    window.open(url, '_blank');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Редагувати рейс
          </h1>
          <Button variant="secondary" onClick={openMap}>
            🗺️ Карта
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📅 Дати
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Дата завантаження *"
                type="datetime-local"
                value={formData.load_date}
                onChange={(v) => updateField('load_date', v)}
                required
              />
              <Input
                label="Дата вигрузки"
                type="datetime-local"
                value={formData.unload_date}
                onChange={(v) => updateField('unload_date', v)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📍 Точки завантаження *
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Почніть вводити назву міста або села..."
                value={loadSearchQuery}
                onChange={(e) => {
                  setLoadSearchQuery(e.target.value);
                  searchLocation(e.target.value, 'load');
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {loadSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {loadSuggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => addLoadPoint(loc)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-0"
                    >
                      <div className="font-medium">{formatLocationName(loc)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{loc.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {formData.load_points.length > 0 && (
              <div className="space-y-2">
                {formData.load_points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      {idx + 1}. {point.displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLoadPoint(idx)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📍 Точки вигрузки *
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Почніть вводити назву міста або села..."
                value={unloadSearchQuery}
                onChange={(e) => {
                  setUnloadSearchQuery(e.target.value);
                  searchLocation(e.target.value, 'unload');
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {unloadSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {unloadSuggestions.map((loc, idx) => (
                    <div
                      key={idx}
                      onClick={() => addUnloadPoint(loc)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 last:border-0"
                    >
                      <div className="font-medium">{formatLocationName(loc)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{loc.display_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {formData.unload_points.length > 0 && (
              <div className="space-y-2">
                {formData.unload_points.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <span className="flex-1 text-gray-900 dark:text-white font-medium">
                      {idx + 1}. {point.displayName}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeUnloadPoint(idx)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              🚗 Водій та транспорт
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ім'я водія *"
                value={formData.driver_name}
                onChange={(v) => updateField('driver_name', v)}
                required
              />
              <Input
                label="Телефон водія *"
                type="tel"
                value={formData.driver_phone}
                onChange={(v) => updateField('driver_phone', v)}
                required
              />
            </div>
            <Input
              label="Дані авто (наприклад: ДАФ АТ7654ВС / АХ5566ВХ) *"
              value={formData.vehicle_info}
              onChange={(v) => updateField('vehicle_info', v)}
              placeholder="Марка, номер авто / номер причепа"
              required
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              👤 Власник машини
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ім'я власника"
                value={formData.owner_name}
                onChange={(v) => updateField('owner_name', v)}
              />
              <Input
                label="Телефон власника"
                type="tel"
                value={formData.owner_phone}
                onChange={(v) => updateField('owner_phone', v)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📞 Замовник
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ім'я замовника *"
                value={formData.client_name}
                onChange={(v) => updateField('client_name', v)}
                required
              />
              <Input
                label="Телефон замовника"
                type="tel"
                value={formData.client_phone}
                onChange={(v) => updateField('client_phone', v)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              💰 Фінанси
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Скільки платить замовник (грн) *"
                type="number"
                value={formData.client_payment}
                onChange={(v) => updateField('client_payment', v)}
                required
              />
              <Input
                label="Моя маржа (грн) *"
                type="number"
                value={formData.my_margin}
                onChange={(v) => updateField('my_margin', v)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Хто платить маржу? *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="margin_payer"
                    value="client"
                    checked={formData.margin_payer === 'client'}
                    onChange={(e) => updateField('margin_payer', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900 dark:text-white">Замовник</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="margin_payer"
                    value="carrier"
                    checked={formData.margin_payer === 'carrier'}
                    onChange={(e) => updateField('margin_payer', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900 dark:text-white">Перевізник</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📊 Статус
            </h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PENDING"
                  checked={formData.status === 'PENDING'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-4 h-4 text-orange-600"
                />
                <span className="text-gray-900 dark:text-white">Очікую</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="IN_PROGRESS"
                  checked={formData.status === 'IN_PROGRESS'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900 dark:text-white">В процесі</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="COMPLETED"
                  checked={formData.status === 'COMPLETED'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-gray-900 dark:text-white">Завершено</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="CANCELLED"
                  checked={formData.status === 'CANCELLED'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-gray-900 dark:text-white">Скасовано</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => router.push('/dashboard')}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button 
              type="submit" 
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
