import React from 'react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  className,
}) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            'w-full appearance-none rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 pr-10 text-white',
            'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
            'transition-all duration-200',
            error && 'border-danger focus:ring-danger/50 focus:border-danger',
            className
          )}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral" />
      </div>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
};