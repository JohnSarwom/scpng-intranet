import React, { useState } from 'react';

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tabLabel: string) => void;
}

const CustomTabs: React.FC<TabsProps> = ({ tabs, defaultTab, activeTab: controlledActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || (tabs.length > 0 ? tabs[0].label : ''));

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabClick = (tabLabel: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabLabel);
    }
    if (onTabChange) {
      onTabChange(tabLabel);
    }
  };

  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-2 -mb-px border-b-2 ${
              activeTab === tab.label
                ? 'border-intranet-primary text-intranet-primary'
                : 'border-transparent hover:text-gray-600 hover:border-gray-300'
            } focus:outline-none font-medium`}
            onClick={() => handleTabClick(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((tab) => tab.label === activeTab)?.content}
      </div>
    </div>
  );
};

export default CustomTabs; 