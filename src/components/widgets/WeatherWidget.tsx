'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  city: string;
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('Kyiv');

  useEffect(() => {
    loadWeather();
  }, [city]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      // Використовуємо Open-Meteo API (безкоштовний, без API ключа)
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=uk&format=json`
      );
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name } = geoData.results[0];
        
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
        );
        const weatherData = await weatherRes.json();
        
        const weatherCode = weatherData.current.weather_code;
        const weatherIcon = getWeatherIcon(weatherCode);
        const weatherDesc = getWeatherDescription(weatherCode);
        
        setWeather({
          city: name,
          temp: Math.round(weatherData.current.temperature_2m),
          description: weatherDesc,
          icon: weatherIcon,
          humidity: weatherData.current.relative_humidity_2m,
          windSpeed: Math.round(weatherData.current.wind_speed_10m),
        });
      }
    } catch (error) {
      console.error('Помилка завантаження погоди:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number): string => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌧️';
    if (code <= 86) return '🌨️';
    if (code <= 99) return '⛈️';
    return '🌤️';
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Ясно';
    if (code <= 3) return 'Хмарно';
    if (code <= 48) return 'Туман';
    if (code <= 67) return 'Дощ';
    if (code <= 77) return 'Сніг';
    if (code <= 82) return 'Злива';
    if (code <= 86) return 'Снігопад';
    if (code <= 99) return 'Гроза';
    return 'Невідомо';
  };

  const cities = ['Бурштин', 'Львів', 'Варшава',];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {cities.map((c) => (
          <button
            key={c}
            onClick={() => setCity(c)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              city === c
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {weather && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">{weather.city}</h3>
              <p className="text-blue-100">{weather.description}</p>
            </div>
            <div className="text-6xl">{weather.icon}</div>
          </div>
          
          <div className="text-5xl font-bold mb-6">{weather.temp}°C</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-blue-100 text-sm">Вологість</p>
              <p className="text-xl font-bold">{weather.humidity}%</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <p className="text-blue-100 text-sm">Вітер</p>
              <p className="text-xl font-bold">{weather.windSpeed} км/год</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
