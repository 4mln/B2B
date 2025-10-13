import { useWindowManager } from '@/context/WindowManagerContext';

export const useWindow = () => {
  const { openWindow, closeWindow, closeAllWindows } = useWindowManager();

  return {
    openWindow,
    closeWindow,
    closeAllWindows,
  };
};
