
import React, { createContext, Dispatch } from 'react';
import { AppState, AppAction, ActionType } from '../types';

export const initialAppState: AppState = {
  bookAngles: null,
  originalBookText: '',
  selectedFormatIds: [],
  generatedHooks: [],
  isLoading: {},
  error: null,
  toasts: [],
  theme: 'light',
};

export const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case ActionType.SET_LOADING:
      return { ...state, isLoading: { ...state.isLoading, [action.payload.key]: action.payload.value } };
    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case ActionType.SET_BOOK_ANGLES:
      if(action.payload) {
        localStorage.setItem('bookAngles', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('bookAngles');
      }
      return { ...state, bookAngles: action.payload };
    case ActionType.SET_ORIGINAL_BOOK_TEXT:
      return { ...state, originalBookText: action.payload };
    case ActionType.SET_SELECTED_FORMAT_IDS:
      return { ...state, selectedFormatIds: action.payload };
    case ActionType.SET_GENERATED_HOOKS:
      return { ...state, generatedHooks: action.payload };
    case ActionType.LOAD_FROM_LOCALSTORAGE:
      const savedAngles = localStorage.getItem('bookAngles');
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return {
          ...state,
          bookAngles: savedAngles ? JSON.parse(savedAngles) : null,
          theme: savedTheme || (prefersDark ? 'dark' : 'light'),
      };
    case ActionType.ADD_TOAST:
        return {
            ...state,
            toasts: [...state.toasts, { ...action.payload, id: Date.now() }],
        };
    case ActionType.REMOVE_TOAST:
        return {
            ...state,
            toasts: state.toasts.filter(toast => toast.id !== action.payload),
        };
    case ActionType.SET_THEME:
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    default:
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>({
  state: initialAppState,
  dispatch: () => null,
});