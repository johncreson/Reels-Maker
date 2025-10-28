
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { ActionType, ContentFormat, Tab } from '../types';
import { CONTENT_FORMATS } from '../constants';
import { TipBox } from './TipBox';

interface Props {
  setActiveTab: (tab: Tab) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const FormatCard: React.FC<{ format: ContentFormat; isSelected: boolean; onSelect: (id: number) => void; }> = ({ format, isSelected, onSelect }) => {
    const baseClasses = "p-4 rounded-lg shadow-sm cursor-pointer border-2 transition-all duration-300 h-full flex flex-col justify-between";
    const selectedClasses = "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-transparent transform -translate-y-1 shadow-lg";
    const unselectedClasses = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#667eea] dark:hover:border-[#8b9ef7] hover:shadow-md";

    return (
        <div className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`} onClick={() => onSelect(format.id)}>
            <h3 className="font-bold text-lg">{format.name}</h3>
            <p className={`text-sm mt-2 ${isSelected ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'}`}>{format.category}</p>
        </div>
    );
};


export const TabChooseFormats: React.FC<Props> = ({ setActiveTab }) => {
    const { state, dispatch } = useContext(AppContext);

    const handleSelectFormat = (id: number) => {
        const newSelection = state.selectedFormatIds.includes(id)
            ? state.selectedFormatIds.filter(fid => fid !== id)
            : [...state.selectedFormatIds, id];
        dispatch({ type: ActionType.SET_SELECTED_FORMAT_IDS, payload: newSelection });
    };

    const handleSelectAll = () => {
        if(state.selectedFormatIds.length === CONTENT_FORMATS.length){
            dispatch({ type: ActionType.SET_SELECTED_FORMAT_IDS, payload: [] });
        } else {
            dispatch({ type: ActionType.SET_SELECTED_FORMAT_IDS, payload: CONTENT_FORMATS.map(f => f.id) });
        }
    };
    
    const handleContinue = () => {
        if (state.selectedFormatIds.length === 0) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Please select at least one format.', type: 'warning' } });
            return;
        }
        setActiveTab('generator');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <TipBox>
                <strong>Next Step:</strong> Select the formats you like (click the cards), then click 'Continue to Generator' to create your hooks!
            </TipBox>

            <div className="my-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="Formats Selected" value={state.selectedFormatIds.length} color="text-[#667eea]" />
                <StatCard title="Potential Hooks" value={state.selectedFormatIds.length * 9} color="text-[#764ba2]" />
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-2 justify-center items-center">
                    <button onClick={handleContinue} className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                        Continue to Generator &rarr;
                    </button>
                    <button onClick={handleSelectAll} className="w-full sm:w-auto flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all">
                         {state.selectedFormatIds.length === CONTENT_FORMATS.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {CONTENT_FORMATS.map(format => (
                    <FormatCard 
                        key={format.id} 
                        format={format}
                        isSelected={state.selectedFormatIds.includes(format.id)}
                        onSelect={handleSelectFormat}
                    />
                ))}
            </div>
        </div>
    );
};