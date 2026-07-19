import React, { useState, useEffect } from 'react';
import { getContextLengthPresets } from '../../lib/hf/kvCache';
import { formatContextLength } from '../../lib/hf/parsers';

interface ContextLengthInputProps {
  maxContext: number;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const ContextLengthInput: React.FC<ContextLengthInputProps> = ({
  maxContext,
  value,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const presets = getContextLengthPresets(maxContext);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = parseInt(e.target.value) || 0;
    const clamped = Math.min(Math.max(newVal, 1), maxContext);
    setInputValue(clamped.toString());
    onChange(clamped);
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || parsed <= 0) {
      setInputValue(value.toString());
    } else {
      const clamped = Math.min(Math.max(parsed, 1), maxContext);
      setInputValue(clamped.toString());
      onChange(clamped);
    }
  };

  const handlePresetClick = (presetValue: number) => {
    setInputValue(presetValue.toString());
    onChange(presetValue);
  };

  const percentage = (value / maxContext) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral">
          Context Length
        </label>
        <span className="text-xs text-neutral">
          {percentage.toFixed(1)}% of max
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={1}
          max={maxContext}
          disabled={disabled}
          className="w-full rounded-lg border border-neutral/20 bg-surface px-4 py-2.5 text-white hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span className="text-sm text-neutral whitespace-nowrap">tokens</span>
      </div>

      {/* Display formatted values */}
      <div className="flex items-center gap-4 text-xs text-neutral">
        <span>Max: {formatContextLength(maxContext)}</span>
        <span>·</span>
        <span>Current: {formatContextLength(value)}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Quick presets */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
              className={`px-2.5 py-1 text-xs rounded-md transition-all duration-200 ${
                value === preset.value
                  ? 'bg-primary text-white'
                  : 'bg-surface-2 text-neutral hover:text-white hover:bg-surface-3'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Warning for large contexts */}
      {value >= 131072 && (
        <div className="flex items-start gap-2 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-500">
          <span>⚠️</span>
          <span>
            Long context ({formatContextLength(value)}) requires significant RAM for KV cache.
          </span>
        </div>
      )}
    </div>
  );
};
