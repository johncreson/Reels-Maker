
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Tab } from '../types';

interface TabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  const { state } = useContext(AppContext);
  const TABS: { id: Tab; label: string, step: number }[] = [
    { id: 'angles', label: 'Book Angles', step: 1 },
    { id: 'formats', label: 'Choose Formats', step: 2 },
    { id: 'generator', label: 'Generate Hooks', step: 3 },
    { id: 'scripts', label: 'Create Scripts', step: 4 },
  ];

  const isTabDisabled = (tabId: Tab) => {
    if (tabId === 'formats' && !state.bookAngles) return true;
    if (tabId === 'generator' && !state.bookAngles) return true;
    if (tabId === 'scripts' && state.generatedHooks.length === 0) return true;
    return false;
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-4 md:space-x-8" aria-label="Tabs">
        {TABS.map((tab) => {
          const disabled = isTabDisabled(tab.id);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !disabled && setActiveTab(tab.id)}
              disabled={disabled}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm md:text-base
                ${isActive
                  ? 'border-[#667eea] text-[#667eea] dark:text-[#8b9ef7]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <span className={`mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full text-white font-bold ${isActive || !disabled ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2]' : 'bg-gray-400'}`}>
                {tab.step}
              </span>
              {tab.label}
            </button>
          )
        })}
      </nav>
    </div>
  );
};