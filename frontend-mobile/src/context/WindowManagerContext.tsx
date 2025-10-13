import { Window, WindowManagerState, WindowOptions } from '@/types/window';
import React, { createContext, ReactNode, useContext } from 'react';
import { create } from 'zustand';

// Zustand store for window management
const useWindowStore = create<WindowManagerState>((set, get) => ({
  windows: [],
  
  openWindow: (id: string, component: ReactNode, options: WindowOptions = {}) => {
    const { windows } = get();
    
    // Close existing window with same id
    const filteredWindows = windows.filter(w => w.id !== id);
    
    // Add new window
    const newWindow: Window = {
      id,
      component,
      options: {
        animationType: 'fade',
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        backdropOpacity: 0.5,
        zIndex: 1000,
        closeOnBackdropClick: true,
        ...options,
      },
    };
    
    set({ windows: [...filteredWindows, newWindow] });
  },
  
  closeWindow: (id?: string) => {
    const { windows } = get();
    
    if (id) {
      // Close specific window
      const filteredWindows = windows.filter(w => w.id !== id);
      set({ windows: filteredWindows });
    } else {
      // Close last window
      const newWindows = windows.slice(0, -1);
      set({ windows: newWindows });
    }
  },
  
  closeAllWindows: () => {
    set({ windows: [] });
  },
}));

// Context for React components
const WindowManagerContext = createContext<WindowManagerState | null>(null);

// Provider component
export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useWindowStore();
  
  return (
    <WindowManagerContext.Provider value={store}>
      {children}
    </WindowManagerContext.Provider>
  );
};

// Hook to use the window manager
export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};

// Export the store for direct access if needed
export { useWindowStore };
