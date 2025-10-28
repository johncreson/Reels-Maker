
import React, { useState, useCallback, useMemo, useReducer, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { TabBookAngles } from './components/TabBookAngles';
import { TabChooseFormats } from './components/TabChooseFormats';
import { TabGenerateHooks } from './components/TabGenerateHooks';
import { TabCreateScripts } from './components/TabCreateScripts';
import { AppContext, initialAppState, appReducer } from './context/AppContext';
import { ActionType, Tab } from './types';
import { ToastContainer } from './components/Toast';

const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [activeTab, setActiveTab] = useState<Tab>('angles');

  useEffect(() => {
    dispatch({ type: ActionType.LOAD_FROM_LOCALSTORAGE });
  }, []);
  
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'angles':
        return <TabBookAngles setActiveTab={setActiveTab} />;
      case 'formats':
        return <TabChooseFormats setActiveTab={setActiveTab} />;
      case 'generator':
        return <TabGenerateHooks setActiveTab={setActiveTab} />;
      case 'scripts':
        return <TabCreateScripts />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <Header />
        <main className="container mx-auto p-4 md:p-8">
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="mt-6">
            {renderTabContent()}
          </div>
        </main>
        <ToastContainer />
      </div>
    </AppContext.Provider>
  );
};

export default App;