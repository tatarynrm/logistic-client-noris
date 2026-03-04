'use client';

interface StatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  onChange?: (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') => void;
  editable?: boolean;
}

const statusConfig = {
  PENDING: {
    label: 'Очікую',
    icon: '⏳',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
    hoverColor: 'hover:bg-amber-100 dark:hover:bg-amber-900/40',
  },
  IN_PROGRESS: {
    label: 'В процесі',
    icon: '🚛',
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50 animate-pulse-subtle',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/40',
  },
  COMPLETED: {
    label: 'Завершено',
    icon: '✅',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
    hoverColor: 'hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  },
  CANCELLED: {
    label: 'Скасовано',
    icon: '❌',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
    hoverColor: 'hover:bg-rose-100 dark:hover:bg-rose-900/40',
  },
};

export default function StatusBadge({ status, onChange, editable = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  const cycleStatus = () => {
    if (!editable || !onChange) return;
    const statuses: Array<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'> = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onChange(statuses[nextIndex]);
  };

  const baseClasses = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 ${config.color}`;

  if (editable) {
    return (
      <button
        onClick={cycleStatus}
        className={`${baseClasses} ${config.hoverColor} cursor-pointer active:scale-95 shadow-sm hover:shadow-md`}
      >
        <span className="text-sm">{config.icon}</span>
        <span className="uppercase tracking-wider">{config.label}</span>
      </button>
    );
  }

  return (
    <span className={baseClasses}>
      <span className="text-sm">{config.icon}</span>
      <span className="uppercase tracking-wider">{config.label}</span>
    </span>
  );
}
