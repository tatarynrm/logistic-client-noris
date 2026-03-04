'use client';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300 shadow-sm hover:border-slate-400 dark:hover:border-slate-600"
      />
    </div>
  );
}
