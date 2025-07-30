import React from 'react';
import { motion } from 'framer-motion';

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
}

interface TabsProps {
  tabs: {
    id: string;
    label: string;
    count?: number;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tab: React.FC<TabProps> = ({ label, active, onClick, count }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md relative ${
        active
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
          active 
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 dark:bg-blue-400"
          layoutId="tabIndicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </button>
  );
};

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
      <div className="flex space-x-2 justify-center">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            count={tab.count}
          />
        ))}
      </div>
    </div>
  );
};
