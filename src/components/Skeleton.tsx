'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export default function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-24 w-full rounded-2xl',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800/50 ${variantClasses[variant]} ${className}`} />
  );
}
