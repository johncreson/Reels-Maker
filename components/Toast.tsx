
import React, { useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { ToastMessage, ActionType } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationIcon } from './Icons';

const icons = {
  success: <CheckCircleIcon />,
  error: <XCircleIcon />,
  warning: <ExclamationIcon />,
};

const colors = {
    success: 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/50 dark:border-green-500 dark:text-green-200',
    error: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/50 dark:border-red-500 dark:text-red-200',
    warning: 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/50 dark:border-orange-500 dark:text-orange-200',
};

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg shadow-lg border-l-4 ${colors[toast.type]} animate-fade-in-right`}>
      {icons[toast.type]}
      <div className="ml-3 text-sm font-medium">{toast.message}</div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent rounded-lg focus:ring-2 focus:ring-gray-400 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 inline-flex h-8 w-8"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);

  const handleDismiss = (id: number) => {
    dispatch({ type: ActionType.REMOVE_TOAST, payload: id });
  };

  return (
    <div className="fixed top-5 right-5 w-full max-w-xs z-50">
      {state.toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};