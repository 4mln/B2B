import { create } from 'zustand';

export type MessageBoxType = 'info' | 'warning' | 'error';

export type MessageBoxAction = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
};

export type MessageBoxState = {
  isVisible: boolean;
  type?: MessageBoxType;
  title?: string;
  message?: string;
  actions: MessageBoxAction[];
  show: (payload: { type?: MessageBoxType; title?: string; message?: string; actions?: MessageBoxAction[] }) => void;
  hide: () => void;
};

export const useMessageBoxStore = create<MessageBoxState>((set) => ({
  isVisible: false,
  type: undefined,
  title: undefined,
  message: undefined,
  actions: [],
  show: ({ type, title, message, actions }) =>
    set({ isVisible: true, type, title, message, actions: actions && actions.length ? actions : [] }),
  hide: () => set({ isVisible: false, type: undefined, title: undefined, message: undefined, actions: [] }),
}));

// Helper functions for different message types with dynamic translations
export const showInfoMessage = (message: string, actions?: MessageBoxAction[], title?: string) => {
  useMessageBoxStore.getState().show({
    type: 'info',
    title: title || 'messageBox.info', // Use translation key
    message,
    actions
  });
};

export const showWarningMessage = (message: string, actions?: MessageBoxAction[], title?: string) => {
  useMessageBoxStore.getState().show({
    type: 'warning',
    title: title || 'messageBox.warning', // Use translation key
    message,
    actions
  });
};

export const showErrorMessage = (message: string, actions?: MessageBoxAction[], title?: string) => {
  useMessageBoxStore.getState().show({
    type: 'error',
    title: title || 'messageBox.error', // Use translation key
    message,
    actions
  });
};



