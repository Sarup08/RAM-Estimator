import React from 'react';
import { QuantOption } from '../../constants/providers';

interface QuantSelectorProps {
  options: QuantOption[];
  value: string;
  onChange: (quant: string) => void;
  disabled?: boolean;
}

export const QuantSelector: React.FC<QuantSelectorProps> = ({
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const selectedQuant = options.find(opt => opt.label === value);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral">
        Precision (Quantization)
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || options.length === 0}
        className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 text-white appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.length === 0 ? (
          <option value="" disabled>No quantizations available</option>
        ) : (
          options.map((option) => (
            <option key={option.label} value={option.label}>
              {option.label} ({option.bytes} bytes/param)
            </option>
          ))
        )}
      </select>
      {selectedQuant && (
        <p className="text-xs text-neutral">
          {selectedQuant.bytes} bytes per parameter
          {selectedQuant.bytes < 1 && ` (${(selectedQuant.bytes * 100).toFixed(0)}% of FP16)`}
        </p>
      )}
    </div>
  );
};
