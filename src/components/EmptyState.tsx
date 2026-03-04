'use client';

import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ 
  title, 
  description, 
  icon = '📂', 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 shadow-inner flex items-center justify-center text-5xl mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 font-medium leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="!rounded-2xl shadow-glow">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
