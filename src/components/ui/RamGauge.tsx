import { clsx } from 'clsx';
import React from 'react';

interface RamGaugeProps {
  currentGB: number;
  maxGB: number;
  label: string;
}

export const RamGauge: React.FC<RamGaugeProps> = ({
  currentGB,
  maxGB = 256,
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-neutral">{label}</span>
        <span className="text-sm font-data text-white">{currentGB.toFixed(1)} GB</span>
      </div>
      <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-neutral/60 text-right">
        Max: {maxGB} GB
      </div>
    </div>
  );
};