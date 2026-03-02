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
        className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center gap-2"
        title="Віджети"
      >
        <span className="text-lg">📊</span>
        <span className="hidden sm:inline text-sm font-medium">Віджети</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setActiveWidget(null);
        }}
        title="Віджети"
        size="lg"
      >
        <div className="flex gap-4 h-[500px]">
          {/* Sidebar з списком віджетів */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 pr-4">
            <div className="space-y-2">
              {AVAILABLE_WIDGETS.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => handleWidgetClick(widget.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    activeWidget === widget.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{widget.icon}</span>
                    <span className="text-sm font-medium">{widget.name}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 Оберіть віджет зі списку для перегляду
              </p>
            </div>
          </div>

          {/* Контент віджета */}
          <div className="flex-1 overflow-y-auto">
            {activeWidget && activeWidgetData ? (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-3xl">{activeWidgetData.icon}</span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeWidgetData.name}
                  </h3>
                </div>
                <activeWidgetData.component />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Оберіть віджет зі списку
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
