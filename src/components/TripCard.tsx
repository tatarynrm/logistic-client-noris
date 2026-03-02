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
  onStatusChange: (status: 'pending' | 'paid' | 'waiting') => void;
}

export default function TripCard({ trip, onDelete, onStatusChange }: TripCardProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('uk-UA', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRouteDisplay = () => {
    const loadPoints = trip.load_points as unknown as LocationPoint[];
    const unloadPoints = trip.unload_points as unknown as LocationPoint[];
    
    if (loadPoints.length > 0 && unloadPoints.length > 0) {
      return `${loadPoints[0].displayName} → ${unloadPoints[0].displayName}`;
    }
    return "N/A";
  };
const getRouteDisplayAll = () => {
  const loadPoints = (trip.load_points as unknown as LocationPoint[]) || [];
  const unloadPoints = (trip.unload_points as unknown as LocationPoint[]) || [];
  
  const allPoints = [...loadPoints, ...unloadPoints];

  if (allPoints.length > 0) {
    return allPoints.map(point => point.displayName).join(" → ");
  }
  
  return "N/A";
};
  const getAllPoints = (points: LocationPoint[]) => {
    return points.map((p, i) => `${i + 1}. ${p.displayName}`).join(', ');
  };

  const loadPoints = trip.load_points as unknown as LocationPoint[];
  const unloadPoints = trip.unload_points as unknown as LocationPoint[];

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Фіксована шапка */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            <div>Маршрут</div>
            <div className="hidden md:block">Водій</div>
            <div className="hidden md:block">Замовник</div>
            <div className="hidden md:block">Транспорт</div>
            <div>Фінанси</div>
            <div className="text-right">Дії</div>
          </div>
        </div>

        {/* Контент */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-start">
            {/* Маршрут */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {getRouteDisplayAll()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📅 {formatDate(trip.load_date)}
                {trip.unload_date && ` → ${formatDate(trip.unload_date)}`}
              </p>
              {loadPoints.length > 1 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  📍 {loadPoints.length} точок завантаження
                </p>
              )}
              {unloadPoints.length > 1 && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  📍 {unloadPoints.length} точок вигрузки
                </p>
              )}
            </div>

            {/* Водій */}
            <div className="hidden md:block space-y-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                👤 {trip.driver_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                📞 {trip.driver_phone}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                🚗 {trip.vehicle_info}
              </p>
            </div>

            {/* Замовник */}
            <div className="hidden md:block space-y-1">
              <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                🏢 {trip.client_name}
              </p>
              {trip.client_phone && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  📞 {trip.client_phone}
                </p>
              )}
            </div>

            {/* Транспорт/Власник */}
            <div className="hidden md:block space-y-1">
              {trip.owner_name ? (
                <>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    👨‍💼 {trip.owner_name}
                  </p>
                  {trip.owner_phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      📞 {trip.owner_phone}
                    </p>
                  )}
                  <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                    🚗 {trip.vehicle_info}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🚗 {trip.vehicle_info}
                </p>
              )}
            </div>
            
            {/* Фінанси */}
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                {trip.client_payment} грн
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                💰 {trip.my_margin} грн
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trip.margin_payer === 'client' ? '👤 Замовник' : '🚛 Перевізник'}
              </p>
              <div className="mt-1">
                <StatusBadge 
                  status={trip.status} 
                  onChange={onStatusChange}
                  editable
                />
              </div>
            </div>

            {/* Дії */}
            <div className="flex md:flex-col lg:flex-row gap-2 justify-end">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setDetailsOpen(true)}
              >
                ℹ️
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.open(`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${loadPoints.map(p => `${p.lat},${p.lng}`).join(';')};${unloadPoints.map(p => `${p.lat},${p.lng}`).join(';')}`, '_blank')}
              >
                🗺️
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => router.push(`/trips/${trip.id}/edit`)}
              >
                ✏️
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={onDelete}
              >
                🗑️
              </Button>
            </div>
          </div>

          {/* Мобільна версія - додаткова інформація */}
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">👤</span>
              <span className="text-gray-800 dark:text-white">{trip.driver_name}</span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">{trip.driver_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">🏢</span>
              <span className="text-gray-800 dark:text-white">{trip.client_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">🚗</span>
              <span className="text-gray-600 dark:text-gray-400">{trip.vehicle_info}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Детальна інформація про рейс"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📅 Дати</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Завантаження:</span> {formatDateTime(trip.load_date)}
              </p>
              {trip.unload_date && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Вигрузка:</span> {formatDateTime(trip.unload_date)}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📍 Маршрут</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  Точки завантаження ({loadPoints.length}):
                </p>
                <div className="space-y-1">
                  {loadPoints.map((point, idx) => (
                    <p key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      {idx + 1}. {point.displayName}
                    </p>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  Точки вигрузки ({unloadPoints.length}):
                </p>
                <div className="space-y-1">
                  {unloadPoints.map((point, idx) => (
                    <p key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      {idx + 1}. {point.displayName}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">🚗 Водій та транспорт</h3>
            <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Водій:</span> {trip.driver_name}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Телефон:</span> {trip.driver_phone}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Транспорт:</span> {trip.vehicle_info}
              </p>
            </div>
          </div>

          {(trip.owner_name || trip.owner_phone) && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">👤 Власник машини</h3>
              <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                {trip.owner_name && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Ім'я:</span> {trip.owner_name}
                  </p>
                )}
                {trip.owner_phone && (
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Телефон:</span> {trip.owner_phone}
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📞 Замовник</h3>
            <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Ім'я:</span> {trip.client_name}
              </p>
              {trip.client_phone && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Телефон:</span> {trip.client_phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">💰 Фінанси</h3>
            <div className="space-y-2 text-sm bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Оплата від замовника:</span> {trip.client_payment} грн
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Моя маржа:</span> {trip.my_margin} грн
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Хто платить маржу:</span> {trip.margin_payer === 'client' ? 'Замовник' : 'Перевізник'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">📊 Статус</h3>
            <StatusBadge status={trip.status} onChange={onStatusChange} editable />
          </div>
        </div>
      </Modal>
    </>
  );
}
