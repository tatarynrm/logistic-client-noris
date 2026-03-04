'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/validations/auth';
import { useRegister } from '@/hooks/useAuth';
import Button from '@/components/Button';
import ThemeToggle from '@/components/ThemeToggle';

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background-light dark:bg-background-dark relative overflow-hidden font-sans">
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '3s' }}></div>

      {/* Mesh Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="absolute top-8 right-8 z-50 animate-fade-in">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md glass-card relative z-10 animate-slide-up border-cyan-500/10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-glow mb-6 text-white text-4xl animate-float">
            �
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Реєстрація <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">v2.0</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-display font-bold text-xs uppercase tracking-[0.3em]">
            Join the elite logistics network
          </p>
        </div>

        {registerMutation.isError && (
          <div className="mb-8 p-4 bg-rose-500/5 border border-rose-500/20 text-rose-500 text-[10px] font-display font-black uppercase tracking-widest rounded-2xl animate-shake flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {registerMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3 animate-fade-in animate-delay-100">
            <label className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Повне ім'я</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors duration-300">👤</span>
              <input
                type="text"
                {...register('name')}
                placeholder="Максим Татарин"
                className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300 font-medium"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-[10px] font-display font-black text-rose-500 uppercase tracking-widest ml-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3 animate-fade-in animate-delay-200">
            <label className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Адреса</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors duration-300">📧</span>
              <input
                type="email"
                {...register('email')}
                placeholder="office@logistic.ua"
                className="w-full pl-14 pr-6 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300 font-medium"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-[10px] font-display font-black text-rose-500 uppercase tracking-widest ml-1">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 animate-fade-in animate-delay-300">
            <div className="space-y-3">
              <label className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Пароль</label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300 font-medium"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-display font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Повтор</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-white/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all duration-300 font-medium"
              />
            </div>
          </div>
          {(errors.password || errors.confirmPassword) && (
            <p className="text-[10px] font-display font-black text-rose-500 uppercase tracking-widest ml-1">
              {errors.password?.message || errors.confirmPassword?.message}
            </p>
          )}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full !py-5 shadow-glow !rounded-2xl !bg-cyan-600 hover:!bg-cyan-500 transition-all active:scale-[0.98] font-display font-black tracking-[0.2em] text-[11px] uppercase text-white border-none relative overflow-hidden group mt-4 animate-fade-in animate-delay-300"
          >
            <span className="relative z-10">{registerMutation.isPending ? 'Завантаження...' : 'Створити акаунт'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-white/5 animate-fade-in animate-delay-500">
          <p className="text-center text-[11px] font-display font-bold text-slate-500 uppercase tracking-widest">
            Вже маєте акаунт?{' '}
            <a href="/auth/login" className="text-cyan-500 hover:text-cyan-400 transition-colors">
              Увійти в систему
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
