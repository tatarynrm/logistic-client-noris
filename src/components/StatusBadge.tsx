'use client';

interface StatusBadgeProps {
  status: 'pending' | 'paid' | 'waiting';
  onChange?: (status: 'pending' | 'paid' | 'waiting') => void;
  editable?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Очікую',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    hoverColor: 'hover:bg-orange-200 dark:hover:bg-orange-900/50',
  },
  paid: {
    label: 'Оплачено',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    hoverColor: 'hover:bg-green-200 dark:hover:bg-green-900/50',
  },
  waiting: {
    label: 'Чекаю оплату',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    hoverColor: 'hover:bg-red-200 dark:hover:bg-red-900/50',
  },
};

export default function StatusBadge({ status, onChange, editable = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  const cycleStatus = () => {
    if (!editable || !onChange) return;
    
    const statuses: Array<'pending' | 'paid' | 'waiting'> = ['pending', 'waiting', 'paid'];
    const currentIndex = statuses.indexOf(status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    onChange(statuses[nextIndex]);
  };

  if (editable) {
    return (
      <button
        onClick={cycleStatus}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${config.color} ${config.hoverColor} cursor-pointer`}
      >
        {config.label}
      </button>
    );
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
