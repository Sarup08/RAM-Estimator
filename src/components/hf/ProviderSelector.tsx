import React from 'react';
import { Provider, PROVIDER_OPTIONS } from '../../constants/providers';

interface ProviderSelectorProps {
  value: string;
  onChange: (providerId: string) => void;
  disabled?: boolean;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const selectedProvider = PROVIDER_OPTIONS.find(opt => opt.value === value);
  
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral">
        Provider
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 text-white appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
      >
        <option value="" disabled>
          Select a provider...
        </option>
        {PROVIDER_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selectedProvider && (
        <p className="text-xs text-neutral">
          Click to browse models for {selectedProvider.label.split(' ')[1]}
        </p>
      )}
    </div>
  );
};
