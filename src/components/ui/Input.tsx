import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-neutral"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 text-white',
          'placeholder:text-neutral/50',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
          'transition-all duration-200',
          error && 'border-danger focus:ring-danger/50 focus:border-danger',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
};