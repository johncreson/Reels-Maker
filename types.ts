
export type Tab = 'angles' | 'formats' | 'generator' | 'scripts';

export interface BookAngle {
  id: string;
  name: string;
  emoji: string;
  placeholder: string;
  helpText: string;
}

export type BookAnglesData = {
  [key: string]: string;
};

export interface ContentFormat {
  id: number;
  name: string;
  category: string;
  example: string;
}

export interface GeneratedHook {
  formatName: string;
  variation: number;
  category: string;
  hookText: string;
}

export interface ScriptOutput {
  title: string;
  subtitle: string;
  characterGuide: string;
  settingGuide: string;
  videoScript: Shot[];
  productionNotes: string;
  metadata: {
    platform: string;
    duration: string;
    category: string;
    shotCount: number;
  }
}

export interface Shot {
  shotNumber: number;
  name: string;
  timing: string;
  voiceover: string;
  visual: string;
  aiPrompt: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

// CONTEXT & REDUCER TYPES
export interface AppState {
  bookAngles: BookAnglesData | null;
  originalBookText: string;
  selectedFormatIds: number[];
  generatedHooks: GeneratedHook[];
  isLoading: { [key: string]: boolean };
  error: string | null;
  toasts: ToastMessage[];
  theme: 'light' | 'dark';
}

export enum ActionType {
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_BOOK_ANGLES = 'SET_BOOK_ANGLES',
  SET_ORIGINAL_BOOK_TEXT = 'SET_ORIGINAL_BOOK_TEXT',
  SET_SELECTED_FORMAT_IDS = 'SET_SELECTED_FORMAT_IDS',
  SET_GENERATED_HOOKS = 'SET_GENERATED_HOOKS',
  LOAD_FROM_LOCALSTORAGE = 'LOAD_FROM_LOCALSTORAGE',
  ADD_TOAST = 'ADD_TOAST',
  REMOVE_TOAST = 'REMOVE_TOAST',
  SET_THEME = 'SET_THEME',
}

export type AppAction =
  | { type: ActionType.SET_LOADING; payload: { key: string; value: boolean } }
  | { type: ActionType.SET_ERROR; payload: string | null }
  | { type: ActionType.SET_BOOK_ANGLES; payload: BookAnglesData | null }
  | { type: ActionType.SET_ORIGINAL_BOOK_TEXT; payload: string }
  | { type: ActionType.SET_SELECTED_FORMAT_IDS; payload: number[] }
  | { type: ActionType.SET_GENERATED_HOOKS; payload: GeneratedHook[] }
  | { type: ActionType.LOAD_FROM_LOCALSTORAGE }
  | { type: ActionType.ADD_TOAST, payload: Omit<ToastMessage, 'id'> }
  | { type: ActionType.REMOVE_TOAST, payload: number }
  | { type: ActionType.SET_THEME, payload: 'light' | 'dark' };