import { clsx } from 'clsx';
import React from 'react';

interface RamGaugeProps {
  currentGB: number;
  maxGB: number;
  label: string;
}

export const RamGauge: React.FC<RamGaugeProps> = ({
  currentGB,
  maxGB = 8192,
  label,
}) => {
  const percentage = Math.min((currentGB / maxGB) * 100, 100);
  const isWarning = percentage > 75;
  const isCritical = percentage > 90;

  const getColor = () => {
    if (isCritical) return 'bg-danger';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-accent';
  };

  // Format display value based on magnitude
  const formatValue = (gb: number) => {
    if (gb >= 1024 * 1024) {
      return `${(gb / (1024 * 1024)).toFixed(2)} PB`;
    } else if (gb >= 1024) {
      return `${(gb / 1024).toFixed(2)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-neutral">{label}</span>
        <span className="text-sm font-data text-white">{formatValue(currentGB)}</span>
      </div>
      <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-neutral/60 text-right">
        Max: {formatValue(maxGB)}
      </div>
    </div>
  );
};