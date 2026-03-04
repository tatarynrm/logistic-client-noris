'use client';

import { useState } from 'react';
import Modal from '../Modal';
import CurrencyRates from '../CurrencyRates';
import WeatherWidget from './WeatherWidget';

interface Widget {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType;
}

const AVAILABLE_WIDGETS: Widget[] = [
  {
    id: 'currency',
    name: 'Курси валют',
    icon: '💱',
    component: CurrencyRates,
  },
  {
    id: 'weather',
    name: 'Погода',
    icon: '🌤️',
    component: WeatherWidget,
  },
];

export default function WidgetSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

  const handleWidgetClick = (widgetId: string) => {
    setActiveWidget(widgetId);
  };

  const activeWidgetData = AVAILABLE_WIDGETS.find(w => w.id === activeWidget);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-300 flex items-center gap-2 border border-transparent hover:border-violet-200 dark:hover:border-violet-800/50"
        title="Віджети"
      >
        <span className="text-xl group-hover:scale-110 transition-transform duration-300">📊</span>
        <span className="hidden sm:inline text-sm font-bold">Сервіси</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setActiveWidget(null);
        }}
        title="Корисні сервіси"
        size="lg"
      >
        <div className="flex flex-col md:flex-row gap-6 min-h-0">
          {/* Sidebar */}
          <div className="w-full md:w-56 flex-shrink-0 flex flex-col gap-1.5 overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Доступні віджети</p>
            {AVAILABLE_WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => handleWidgetClick(widget.id)}
                className={`w-full group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeWidget === widget.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span className={`text-xl transition-transform duration-200 ${activeWidget === widget.id ? 'scale-110' : 'group-hover:scale-105'}`}>
                  {widget.icon}
                </span>
                <span className="text-sm font-semibold">{widget.name}</span>
              </button>
            ))}

            <p className="text-[10px] leading-relaxed font-medium text-slate-400 dark:text-slate-500 mt-2 px-1">
              💡 Актуальні дані прямо під час роботи
            </p>
          </div>

          {/* Content Area — only this scrolls */}
          <div className="flex-1 min-h-0 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800/50 p-5 overflow-y-auto scrollbar-hide">
            {activeWidget && activeWidgetData ? (
              <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center text-3xl">
                    {activeWidgetData.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {activeWidgetData.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Активний сервіс</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                  <activeWidgetData.component />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-5xl mb-6 animate-bounce-slow">
                  📊
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Оберіть інструмент</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">
                  Будь ласка, натисніть на віджет ліворуч, щоб почати
                </p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
