import { ReactNode } from 'react';

export type AnimationType = 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'custom';

export interface WindowOptions {
  animationType?: AnimationType;
  backdropColor?: string;
  backdropOpacity?: number;
  zIndex?: number;
  closeOnBackdropClick?: boolean;
  customAnimation?: {
    enterStyle?: Record<string, any>;
    exitStyle?: Record<string, any>;
    animation?: string;
  };
}

export interface Window {
  id: string;
  component: ReactNode;
  options: WindowOptions;
}

export interface WindowManagerState {
  windows: Window[];
  openWindow: (id: string, component: ReactNode, options?: WindowOptions) => void;
  closeWindow: (id?: string) => void;
  closeAllWindows: () => void;
}
