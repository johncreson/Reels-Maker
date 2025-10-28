
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ActionType, BookAnglesData, Tab } from '../types';
import { BOOK_ANGLES } from '../constants';
import { extractBookAngles } from '../services/geminiService';
import { AngleInput } from './AngleInput';
import { TipBox } from './TipBox';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { UploadIcon, PasteIcon, MagicIcon, SaveIcon } from './Icons';

interface Props {
  setActiveTab: (tab: Tab) => void;
}

export const TabBookAngles: React.FC<Props> = ({ setActiveTab }) => {
    const { state, dispatch } = useContext(AppContext);
    const [localAngles, setLocalAngles] = useState<BookAnglesData>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pastedText, setPastedText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        if(state.bookAngles) {
            setLocalAngles(state.bookAngles);
        }
    }, [state.bookAngles]);

    const handleAngleChange = (id: string, value: string) => {
        setLocalAngles(prev => ({ ...prev, [id]: value }));
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'File too large. Please upload a file smaller than 10MB.', type: 'error' } });
                return;
            }
            if (file.type === 'text/plain' || file.type === 'application/pdf') {
                analyzeBook(undefined, file);
            } else {
                dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Unsupported file type. Please upload a .txt or .pdf file.', type: 'error' } });
            }
        }
    };

    const handlePasteAndAnalyze = () => {
        if (pastedText.trim()) {
            analyzeBook(pastedText);
            setIsModalOpen(false);
            setPastedText('');
        } else {
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Please paste some text.', type: 'warning' } });
        }
    };

    const analyzeBook = async (text?: string, file?: File) => {
        dispatch({ type: ActionType.SET_LOADING, payload: { key: 'analyzing', value: true } });
        dispatch({ type: ActionType.SET_ERROR, payload: null });
        try {
            const result = await extractBookAngles(text, file);
            setLocalAngles(result);
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Book analysis complete! Fields have been auto-filled.', type: 'success' } });
            
            // Store original text for later use
            if(text) dispatch({ type: ActionType.SET_ORIGINAL_BOOK_TEXT, payload: text });
            if(file && file.type === 'text/plain') {
                 const reader = new FileReader();
                 reader.onload = (e) => dispatch({ type: ActionType.SET_ORIGINAL_BOOK_TEXT, payload: e.target?.result as string || ''});
                 reader.readAsText(file);
            }
            if(file && file.type === 'application/pdf') {
                // PDF text is not easily extractable on client-side, Gemini handles the file directly
                // So we store a placeholder
                 dispatch({ type: ActionType.SET_ORIGINAL_BOOK_TEXT, payload: `PDF file uploaded: ${file.name}` });
            }


        } catch (error) {
            console.error("Error analyzing book:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during analysis.";
            dispatch({ type: ActionType.ADD_TOAST, payload: { message: `Analysis failed: ${errorMessage}`, type: 'error' } });
        } finally {
            dispatch({ type: ActionType.SET_LOADING, payload: { key: 'analyzing', value: false } });
        }
    };

    const handleSaveAndContinue = () => {
        dispatch({ type: ActionType.SET_BOOK_ANGLES, payload: localAngles });
        dispatch({ type: ActionType.ADD_TOAST, payload: { message: 'Book angles saved!', type: 'success' } });
        setActiveTab('formats');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <TipBox>
                <strong>Next Step:</strong> Upload or paste your book's text to auto-fill the angles with AI, or fill them in manually.
            </TipBox>

            <div className="my-8 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">Upload or Paste Book Text</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600">
                        <UploadIcon /> Upload Book File (PDF/TXT)
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.pdf" className="hidden" />
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-transform hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600">
                        <PasteIcon /> Paste Book Text
                    </button>
                </div>
            </div>

            {state.isLoading.analyzing && <Spinner message="AI is analyzing your book... this may take a moment." />}

            <div className="bg-white p-8 rounded-lg shadow-lg dark:bg-gray-800">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Book Angles Form</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    {BOOK_ANGLES.map(angle => (
                        <AngleInput key={angle.id} angle={angle} value={localAngles[angle.id] || ''} onChange={handleAngleChange} />
                    ))}
                    <div className="text-center mt-8">
                        <button onClick={handleSaveAndContinue} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                           <SaveIcon /> Save Angles & Continue
                        </button>
                    </div>
                </form>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Paste Book Text">
                <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the text of your book here (first 10,000 characters is usually enough)..."
                    className="w-full h-64 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#667eea] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
                <div className="mt-4 flex justify-end">
                    <button onClick={handlePasteAndAnalyze} className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-md transform hover:scale-105 transition-transform">
                        <MagicIcon /> Analyze Text
                    </button>
                </div>
            </Modal>
        </div>
    );
};