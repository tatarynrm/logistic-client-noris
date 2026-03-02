import { TenderRoute } from '@/types/prisma';

// Трансформує дані з Prisma (camelCase) в формат фронтенду (snake_case)
export function transformTenderToTrip(tender: any) {
  return {
    id: tender.id,
    user_id: tender.userId,
    load_date: tender.loadDate,
    unload_date: tender.unloadDate,
    driver_name: tender.driverName,
    driver_phone: tender.driverPhone,
    vehicle_info: tender.vehicleInfo,
    owner_name: tender.ownerName,
    owner_phone: tender.ownerPhone,
    client_name: tender.clientName,
    client_phone: tender.clientPhone,
    client_payment: tender.clientPayment,
    my_margin: tender.myMargin,
    margin_payer: tender.marginPayer,
    status: tender.status,
    created_at: tender.createdAt,
    updated_at: tender.updatedAt,
    load_points: tender.routes
      ? tender.routes
          .filter((r: TenderRoute) => r.type === 'LOADING')
          .map((r: TenderRoute) => ({
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            displayName: r.displayName
          }))
      : [],
    unload_points: tender.routes
      ? tender.routes
          .filter((r: TenderRoute) => r.type === 'UNLOADING')
          .map((r: TenderRoute) => ({
            name: r.name,
            lat: r.lat,
            lng: r.lng,
            displayName: r.displayName
          }))
      : []
  };
}
