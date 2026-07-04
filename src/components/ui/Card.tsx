import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl p-6',
        variant === 'default' && 'bg-surface-2 border border-neutral/10',
        variant === 'elevated' && 'bg-surface-2 shadow-lg border border-neutral/10',
        className
      )}
    >
      {children}
    </div>
  );
};