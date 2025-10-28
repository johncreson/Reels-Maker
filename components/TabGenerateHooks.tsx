
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { ActionType, GeneratedHook, Tab } from '../types';
import { CONTENT_FORMATS } from '../constants';
import { generateHooksWithAI } from '../services/geminiService';
import { TipBox } from './TipBox';
import { Spinner } from './Spinner';
import { CopyIcon, TextFileIcon, CsvIcon, GenerateIcon } from './Icons';

interface Props {
  setActiveTab: (tab: Tab) => void;
}

const HookCard: React.FC<{ hook: GeneratedHook }> = ({ hook }) => {
    const { dispatch } = useContext(AppContext);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(hook.hookText);
        dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Hook copied to clipboard!', type: 'success' } });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-[#667eea] flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">{hook.formatName}</h3>
                    <button onClick={copyToClipboard} className="text-gray-400 hover:text-[#667eea] transition-colors">
                        <CopyIcon />
                    </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">"{hook.hookText}"</p>
            </div>
            <div className="flex items-center text-xs text-gray-500 gap-2">
                <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded-full">{hook.category}</span>
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">{hook.hookText.length} chars</span>
            </div>
        </div>
    );
};

export const TabGenerateHooks: React.FC<Props> = ({ setActiveTab }) => {
    const { state, dispatch } = useContext(AppContext);

    const handleGenerate = async () => {
        if (!state.bookAngles) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Please fill out your book angles first!', type: 'error' } });
            setActiveTab('angles');
            return;
        }
        if (state.selectedFormatIds.length === 0) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Please select at least one format first!', type: 'error' } });
            setActiveTab('formats');
            return;
        }
        if (!state.originalBookText) {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'For best results, please upload or paste your book text first!', type: 'warning' } });
        }
        
        dispatch({ type: ActionType.SET_LOADING, payload: { key: 'generatingHooks', value: true } });
        try {
            const selectedFormats = CONTENT_FORMATS.filter(f => state.selectedFormatIds.includes(f.id));
            const hooks = await generateHooksWithAI(state.bookAngles, selectedFormats, state.originalBookText);
            dispatch({ type: ActionType.SET_GENERATED_HOOKS, payload: hooks });
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: `${hooks.length} hooks generated!`, type: 'success' } });
        } catch (error) {
            console.error("Error generating hooks:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during hook generation.";
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: `Generation failed: ${errorMessage}`, type: 'error' } });
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: { key: 'generatingHooks', value: false } });
        }
    };
    
    const createAndDownloadFile = (filename: string, content: string, type: string) => {
        const blob = new Blob([content], { type });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToText = () => {
        const content = state.generatedHooks.map(h => `${h.formatName}\n${h.hookText}\n`).join('\n---\n');
        createAndDownloadFile('hooks.txt', content, 'text/plain;charset=utf-8;');
    };

    const exportToCSV = () => {
        const header = "Format,Category,Hook\n";
        const rows = state.generatedHooks.map(h => `"${h.formatName}","${h.category}","${h.hookText.replace(/"/g, '""')}"`).join('\n');
        createAndDownloadFile('hooks.csv', header + rows, 'text/csv;charset=utf-8;');
    };

    const copyAll = () => {
        const content = state.generatedHooks.map(h => h.hookText).join('\n\n');
        navigator.clipboard.writeText(content);
        dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'All hooks copied to clipboard!', type: 'success' } });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <TipBox>
                <strong>Next Step:</strong> Click 'Generate Hooks' below to create AI-powered marketing hooks for your book!
            </TipBox>

            <div className="my-8 text-center">
                 <button 
                    onClick={handleGenerate} 
                    disabled={state.isLoading.generatingHooks}
                    className="inline-flex items-center justify-center px-12 py-5 border border-transparent text-xl font-bold rounded-md text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <GenerateIcon />
                    Generate Hooks
                </button>
            </div>

            {state.isLoading.generatingHooks && <Spinner message="Generating hooks with AI... this might take a moment." />}

            {state.generatedHooks.length > 0 && (
                <div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <button onClick={exportToText} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><TextFileIcon /> Export to Text</button>
                        <button onClick={exportToCSV} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><CsvIcon /> Export to CSV</button>
                        <button onClick={copyAll} className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><CopyIcon /> Copy All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {state.generatedHooks.map((hook, index) => (
                            <HookCard key={index} hook={hook} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};