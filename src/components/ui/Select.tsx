import React, { useState, useRef, useEffect } from 'react';
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
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  className,
  placeholder = 'Select...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const safeOptions = options || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = safeOptions.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-neutral">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Selected Value Display */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-white transition-all duration-200',
            'hover:border-primary/50 hover:bg-surface-2',
            isOpen && 'border-primary/50 bg-surface-2 ring-2 ring-primary/50',
            error && 'border-danger ring-2 ring-danger/50',
            !error && 'border-neutral/20 bg-surface',
            className
          )}
        >
          <span className={clsx('truncate', !value && 'text-neutral')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            className={clsx(
              'h-4 w-4 text-neutral transition-transform duration-200 flex-shrink-0 ml-2',
              isOpen && 'rotate-180'
            )} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 rounded-lg border border-neutral/20 bg-surface shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto py-1">
              {safeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full px-4 py-2.5 text-left text-white transition-colors duration-150',
                    'hover:bg-surface-2',
                    option.value === value && 'bg-primary/20 text-primary font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
              {safeOptions.length === 0 && (
                <div className="px-4 py-2.5 text-neutral text-sm">
                  No options available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
};
