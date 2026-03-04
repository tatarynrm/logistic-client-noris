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

  const cityConfigs = [
    { name: 'Київ', id: 'Kyiv' },
    { name: 'Львів', id: 'Lviv' },
    { name: 'Варшава', id: 'Warsaw' },
    { name: 'Бурштин', id: 'Burshtyn' },
  ];

  const getWeatherGradient = (code: number) => {
    if (code === 0) return 'from-amber-400 via-orange-500 to-rose-500'; // Sunny
    if (code <= 3) return 'from-blue-400 via-indigo-500 to-violet-600'; // Cloudy
    if (code <= 48) return 'from-slate-400 to-slate-600'; // Fog
    if (code <= 67) return 'from-indigo-500 via-blue-600 to-slate-700'; // Rain
    if (code <= 77) return 'from-blue-100 via-blue-200 to-slate-300'; // Snow
    if (code <= 99) return 'from-slate-800 via-purple-900 to-black'; // Storm
    return 'from-blue-500 to-indigo-600';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Прогноз завантажується...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex gap-2.5 flex-wrap px-1">
        {cityConfigs.map((c) => (
          <button
            key={c.id}
            onClick={() => setCity(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              city.toLowerCase() === c.id.toLowerCase()
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {weather && (
        <div className={`relative overflow-hidden bg-gradient-to-br ${getWeatherGradient(weather.temp > 30 ? 0 : 3)} rounded-[2.5rem] p-8 text-white shadow-2xl transition-all duration-700 group`}>
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Поточна Погода</span>
                 <div className="w-1 h-1 rounded-full bg-white opacity-50 animate-pulse"></div>
              </div>
              <h3 className="text-4xl font-black tracking-tighter mb-1 select-none">{weather.city}</h3>
              <p className="text-sm font-bold opacity-90 tracking-wide">{weather.description}</p>
            </div>
            <div className="text-7xl drop-shadow-2xl animate-bounce-slow filter saturate-150">
               {weather.icon}
            </div>
          </div>
          
          <div className="mt-10 mb-8 relative z-10 flex items-baseline">
             <span className="text-7xl sm:text-8xl font-black tracking-tighter drop-shadow-xl">{weather.temp}</span>
             <span className="text-3xl font-black opacity-60 ml-1">°C</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group-hover:bg-white/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Вологість</p>
              <p className="text-xl font-black">{weather.humidity}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group-hover:bg-white/20 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Вітер</p>
              <p className="text-xl font-black">{weather.windSpeed} <span className="text-xs opacity-60">км/год</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
