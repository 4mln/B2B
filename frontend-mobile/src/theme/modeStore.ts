import '@/polyfills/web';
import { saveItem } from '@/utils/secureStore';
// @ts-expect-error - ensure process.env exists in web/SSR
if (typeof globalThis.process === 'undefined') {
  // @ts-expect-error
  globalThis.process = { env: {} };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = {};
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { create } = require('zustand');

export type ThemeMode = 'light' | 'dark';

interface ThemeModeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

const getStoredThemeWeb = () => {
  try {
    const v = typeof localStorage !== 'undefined' ? localStorage.getItem('app_theme') : null;
    return v || 'light';
  } catch {
    return 'light';
  }
};

const storeTheme = async (mode: ThemeMode) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem('app_theme', mode);
  } catch {}
  try {
    await saveItem('app_theme', mode);
  } catch {}
};

export const useThemeModeStore = create<ThemeModeState>((set, get) => ({
  mode: getStoredThemeWeb(),
  initialized: true,
  setMode: (mode) => {
    console.log('Setting theme mode to:', mode);
    set({ mode });
    storeTheme(mode);
  },
  setInitialized: (initialized) => set({ initialized }),
}));




