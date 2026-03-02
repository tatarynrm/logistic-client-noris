export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LocationPoint {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

export interface Trip {
  id: string;
  user_id: string;
  load_date: string;
  unload_date: string | null;
  load_points: LocationPoint[];
  unload_points: LocationPoint[];
  driver_name: string;
  driver_phone: string;
  vehicle_info: string;
  owner_name?: string;
  owner_phone?: string;
  client_name: string;
  client_phone?: string;
  client_payment: number;
  my_margin: number;
  margin_payer: 'client' | 'carrier';
  status: 'pending' | 'paid' | 'waiting';
  created_at: string;
  updated_at: string;
}

export interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    county?: string;
  };
}

export interface EarningsData {
  period: string;
  totalMargin: number;
  tripCount: number;
}
