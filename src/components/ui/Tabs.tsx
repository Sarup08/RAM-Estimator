import React from 'react';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={clsx('flex gap-1 bg-surface p-1 rounded-lg', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === tab.id
              ? 'bg-primary text-white shadow-sm'
              : 'text-neutral hover:text-white hover:bg-surface-2'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};