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
  { id: 'currency', name: 'Курси валют', icon: '💱', component: CurrencyRates },
  { id: 'weather',  name: 'Погода',      icon: '🌤️', component: WeatherWidget },
];

export default function WidgetSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);

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
        onClose={() => { setIsOpen(false); setActiveWidget(null); }}
        title="Корисні сервіси"
        size="lg"
      >
        {/* 
          Layout: sidebar (fixed, no scroll) + content (scrollable).
          We use a fixed px height so the flex children have a real bound to work within.
          The Modal content area is already overflow-y-auto; the inner content area adds its own scroll.
        */}
        <div className="flex gap-5" style={{ height: '480px' }}>

          {/* ── Sidebar ── */}
          <div className="w-44 flex-shrink-0 flex flex-col gap-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Інструменти</p>

            {AVAILABLE_WIDGETS.map((widget) => (
              <button
                key={widget.id}
                onClick={() => setActiveWidget(widget.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeWidget === widget.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-lg">{widget.icon}</span>
                {widget.name}
              </button>
            ))}

            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-auto px-1 leading-relaxed">
              💡 Актуальні дані прямо під час роботи
            </p>
          </div>

          {/* ── Content panel ── */}
          <div className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hide rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            {activeWidget && activeWidgetData ? (
              <div className="p-5 animate-fade-in">
                {/* Widget header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    {activeWidgetData.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {activeWidgetData.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Активний сервіс</p>
                  </div>
                </div>

                {/* Widget content */}
                <activeWidgetData.component />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl animate-bounce-slow">
                  📊
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Оберіть інструмент</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Натисніть на сервіс ліворуч</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </Modal>
    </>
  );
}
