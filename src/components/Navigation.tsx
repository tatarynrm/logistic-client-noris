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
      <nav className="glass sticky top-5 z-50 mx-4 md:mx-auto max-w-7xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-glass-dark transition-all duration-500 mt-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-10">
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center gap-3 transition-transform active:scale-95"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-glow flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform duration-500">
                  🚚
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tighter">
                    Логістика
                  </span>
                  <span className="text-[10px] font-display font-black uppercase tracking-[0.3em] text-cyan-500/80">
                    System v2.0
                  </span>
                </div>
              </button>

              <div className="hidden lg:flex gap-2 ml-4">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-display font-black uppercase tracking-widest transition-all duration-500 group relative ${isActive(item.href)
                        ? 'text-cyan-500 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive(item.href) && (
                      <div className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-2xl border border-cyan-500/20 blur-[2px] animate-pulse-glow"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-4">
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-2"></div>
              <WidgetSystem />
              <Button
                onClick={() => router.push('/trips/new')}
                className="!px-6 !py-3 !text-[10px] !bg-cyan-500 hover:!bg-cyan-400 shadow-glow"
              >
                ➕ Новий рейс
              </Button>
              <button
                onClick={toggleTheme}
                className="p-3.5 rounded-2xl glass hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all duration-500 hover:shadow-glow hover:border-cyan-500/30 active:scale-90"
                aria-label="Перемкнути тему"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="px-5 py-3 text-[10px] font-display font-black uppercase tracking-widest text-rose-500 hover:text-white hover:bg-rose-500 rounded-2xl border border-rose-500/20 transition-all duration-500 active:scale-95"
              >
                Вийти
              </button>
            </div>

            {/* Animated Burger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl glass text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Меню"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between items-center z-50">
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'}`} />
                <span className={`w-full h-0.5 bg-current rounded transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/50 dark:border-white/5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-fade-in">
            <div className="px-6 py-8 space-y-4">
              {user && (
                <div className="px-4 py-3 glass rounded-2xl flex items-center justify-between">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400">
                    Акаунт
                  </span>
                  <span className="text-[12px] font-display font-black text-slate-900 dark:text-white">
                    {user.name}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 rounded-2xl font-display font-black uppercase tracking-widest transition-all duration-300 ${isActive(item.href)
                        ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20'
                        : 'text-slate-700 dark:text-slate-300 glass hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <WidgetSystem />
              </div>
              <Button
                onClick={() => {
                  router.push('/trips/new');
                  setMobileMenuOpen(false);
                }}
                className="w-full !py-5 !bg-cyan-600 shadow-glow"
              >
                ➕ Новий рейс
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={toggleTheme}
                  className="px-4 py-4 glass text-[10px] font-display font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 rounded-2xl transition-colors flex justify-center items-center"
                >
                  {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
                </button>
                <button
                  onClick={() => {
                    setLogoutModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-4 glass text-[10px] font-display font-black uppercase tracking-widest text-rose-500 rounded-2xl transition-colors flex justify-center items-center"
                >
                  Logout
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
        <div className="space-y-8 p-4 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-float">
            👋
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-display font-bold text-lg leading-relaxed">
            Ви впевнені, що хочете покинути систему?
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLogout}
              className="!w-full !py-5 !bg-rose-500 hover:!bg-rose-600 shadow-glow"
            >
              Так, вийти
            </Button>
            <button
              onClick={() => setLogoutModalOpen(false)}
              className="w-full py-4 text-[10px] font-display font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
