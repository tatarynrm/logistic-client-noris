'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/useAuth';
import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/60 p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl shadow-glow mb-4 text-white text-3xl">
            🚚
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
            Логістика <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-4">v2</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
            Professional Logistics Suite
          </p>
        </div>

        {loginMutation.isError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-black uppercase tracking-widest rounded-2xl animate-shake">
             ❌ {loginMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Email Адреса
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">📧</span>
              <input
                type="email"
                {...register('email')}
                placeholder="email@example.com"
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Пароль
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">🔐</span>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1">{errors.password.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loginMutation.isPending} 
            className="w-full !py-4 shadow-glow !rounded-2xl !bg-blue-600 hover:!bg-blue-700 transition-all active:scale-[0.98] font-black tracking-widest text-[10px] uppercase"
          >
            {loginMutation.isPending ? 'Авторизація...' : 'Продовжити'}
          </Button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Ще не маєте акаунту?{' '}
            <a href="/auth/register" className="text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-blue-500/30 transition-colors">
              Створити зараз
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
