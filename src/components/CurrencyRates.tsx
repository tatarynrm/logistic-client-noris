// src/components/CurrencyRates.tsx
"use client";

import { useEffect, useState } from "react";
import { NBUCurrency } from "@/types/currency";

const currenciesToFetch = ["USD", "EUR", "PLN", "GBP"];

const CurrencyRates = () => {
  const [rates, setRates] = useState<NBUCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const formattedDate = `${year}${month}${day}`;

        const promises = currenciesToFetch.map(async (currency) => {
          const response = await fetch(
            `/api/currency?start=${formattedDate}&end=${formattedDate}&valcode=${currency.toLowerCase()}`
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch ${currency} rate`);
          }
          const data: NBUCurrency[] = await response.json();
          return data[0];
        });

        const results = await Promise.all(promises);
        setRates(results.filter((rate) => rate)); // Filter out any undefined rates
      } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-violet-500 animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Оновлення курсів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800 text-center">
        <span className="text-3xl mb-2 block">⚠️</span>
        <p className="text-rose-600 dark:text-rose-400 font-bold">Помилка завантаження</p>
        <p className="text-xs text-rose-500/80 mt-1">{error}</p>
      </div>
    );
  }

  const getFlag = (cc: string) => {
    switch(cc) {
      case 'USD': return '🇺🇸';
      case 'EUR': return '🇪🇺';
      case 'PLN': return '🇵🇱';
      case 'GBP': return '🇬🇧';
      default: return '🏦';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rates.map((rate) => (
          <div key={rate.cc} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{getFlag(rate.cc)}</span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rate.cc}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[80px]">{rate.txt}</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[10px] text-emerald-500 font-bold">
                 ↑
              </div>
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-black text-slate-900 dark:text-white">{rate.rate.toFixed(2)}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase">UAH</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">Дані НБУ • Оновлено щойно</p>
    </div>
  );
};

export default CurrencyRates;
