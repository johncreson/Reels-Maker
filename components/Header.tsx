
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ActionType } from '../types';
import { SunIcon, MoonIcon } from './Icons';

export const Header: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: ActionType.SET_THEME, payload: newTheme });
  };

  return (
    <header className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white p-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Content Matrix Generator</h1>
          <p className="mt-2 text-lg">AI-powered marketing hooks & video scripts for authors</p>
        </div>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle theme"
        >
          {state.theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};