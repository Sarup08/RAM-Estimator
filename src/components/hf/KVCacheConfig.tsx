import React from 'react';
import { KVQuant } from '../../constants/providers';

interface KVCacheConfigProps {
  value: KVQuant;
  onChange: (quant: KVQuant) => void;
  disabled?: boolean;
  showNote?: boolean;
}

const KV_QUANT_OPTIONS = [
  { value: 'fp16', label: 'FP16', bytes: 2, description: 'Default, best quality' },
  { value: 'fp32', label: 'FP32', bytes: 4, description: 'Highest quality, 2x memory' },
  { value: 'int8', label: 'INT8', bytes: 1, description: 'Half memory, minimal quality loss' },
  { value: 'int4', label: 'INT4', bytes: 0.5, description: 'Quarter memory, some quality loss' },
];

export const KVCacheConfig: React.FC<KVCacheConfigProps> = ({
  value,
  onChange,
  disabled = false,
  showNote = true,
}) => {
  const selectedOption = KV_QUANT_OPTIONS.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral">
        KV Cache Quantization
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as KVQuant)}
        disabled={disabled}
        className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 text-white appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {KV_QUANT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} ({option.bytes} bytes/param) - {option.description}
          </option>
        ))}
      </select>
      
      {showNote && selectedOption && (
        <p className="text-xs text-neutral">
          KV cache stores key-value pairs for each token. Lower quantization saves memory but may reduce quality.
          <br />
          <span className="text-primary">Default: FP16</span> (recommended for most use cases)
        </p>
      )}
    </div>
  );
};
