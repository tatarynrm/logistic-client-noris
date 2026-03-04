'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import Modal from './Modal';
import Button from './Button';
import WidgetSystem from './widgets/WidgetSystem';

interface NavigationProps {
  user: { name: string; email: string } | null;
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: '📊 Рейси', icon: '📊' },
    { href: '/earnings', label: '💰 Заробіток', icon: '💰' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2"
              >
                <span>🚚</span>
                <span className="tracking-tight">Логістика v2</span>
              </button>
              
              <div className="hidden md:flex gap-1 ml-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive(item.href)
                        ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <WidgetSystem />
              <button
                onClick={() => router.push('/trips/new')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-glow-green transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <span>➕</span> Новий рейс
              </button>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-300"
                aria-label="Перемкнути тему"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all duration-300"
              >
                Вийти
              </button>
            </div>

            {/* Animated Burger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -mr-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
              aria-label="Меню"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between items-center z-50">
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 absolute w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg rounded-b-2xl animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              {user && (
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 px-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  {user.name}
                </div>
              )}
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2">
                <WidgetSystem />
              </div>
              <button
                onClick={() => {
                  router.push('/trips/new');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-colors mt-2 shadow-md flex items-center gap-2"
              >
                <span>➕</span> Новий рейс
              </button>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={toggleTheme}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors flex justify-center items-center"
                >
                  {theme === 'light' ? '🌙 Темна тема' : '☀️ Світла тема'}
                </button>
                <button
                  onClick={() => {
                    setLogoutModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-semibold transition-colors hover:bg-red-100 dark:hover:bg-red-500/20 flex justify-center items-center"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <Modal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Підтвердження виходу"
        size="sm"
      >
        <div className="space-y-6 p-2">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Ви впевнені, що хочете вийти з облікового запису?
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setLogoutModalOpen(false)}
              className="flex-1 !rounded-2xl"
            >
              Скасувати
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex-1 !rounded-2xl !bg-rose-500 hover:!bg-rose-600 shadow-glow-rose"
            >
              Вийти
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
