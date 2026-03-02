import { LocationSuggestion } from '@/types';

export function formatLocationName(location: LocationSuggestion): string {
  const addr = location.address;
  
  // Якщо є місто - показуємо тільки місто
  if (addr.city) {
    return addr.city;
  }
  
  // Якщо є містечко - показуємо тільки містечко
  if (addr.town) {
    return addr.town;
  }
  
  // Якщо село або селище - показуємо з областю
  if (addr.village) {
    const region = addr.state || addr.county || '';
    return region ? `${addr.village}, ${region}` : addr.village;
  }
  
  if (addr.hamlet) {
    const region = addr.state || addr.county || '';
    return region ? `${addr.hamlet}, ${region}` : addr.hamlet;
  }
  
  // Якщо нічого не знайдено - повертаємо перше слово з display_name
  const parts = location.display_name.split(',');
  return parts[0].trim();
}

export function getShortLocationName(displayName: string): string {
  // Витягуємо перше значення до коми
  const parts = displayName.split(',');
  return parts[0].trim();
}
