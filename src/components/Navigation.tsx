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
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                🚚 Логістика v1
              </button>
              
              <div className="hidden md:flex gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                ➕ Новий рейс
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Перемкнути тему"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Вийти
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="px-4 py-3 space-y-2">
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
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
                  className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
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
                className="w-full text-left px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                ➕ Новий рейс
              </button>
              <button
                onClick={toggleTheme}
                className="w-full text-left px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                {theme === 'light' ? '🌙 Темна тема' : '☀️ Світла тема'}
              </button>
              <button
                onClick={() => {
                  setLogoutModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Вийти
              </button>
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
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Ви впевнені, що хочете вийти з облікового запису?
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setLogoutModalOpen(false)}
              className="flex-1"
            >
              Скасувати
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              className="flex-1"
            >
              Вийти
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
