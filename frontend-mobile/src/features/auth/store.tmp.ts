import '@/polyfills/web';
import { deleteItem, getItem, saveItem } from "@/utils/secureStore";
import { create } from 'zustand';
import { User, hasCapability } from "./types";

// Ensure process.env for SSR/web
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = { env: {} };
} else if (typeof (globalThis as any).process.env === 'undefined') {
  (globalThis as any).process.env = {};
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  approved: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  hasCapability: (capability: string) => boolean;
  updateUserCapabilities: (capabilities: string[]) => void;
}

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  approved: false,
  isAuthenticated: false,
  isLoading: true,
  error: null,
} as const;

// Helper for handling timeouts
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  let timeoutHandle: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      console.log(`🔧 Timeout reached: ${timeoutMessage}`);
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => clearTimeout(timeoutHandle));
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState,

  login: async (user: User, token: string, refreshToken?: string) => {
    try {
      await saveItem("auth_token", token);
      if (refreshToken) {
        await saveItem("refresh_token", refreshToken);
      }
      await saveItem("login_approved", "true");
      set({
        user,
        token,
        refreshToken,
        approved: true,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (e) {
      console.error("Login failed:", e);
      set({ error: "Failed to save session", isLoading: false });
    }
  },

  logout: async () => {
    try {
      await deleteItem("auth_token");
      await deleteItem("refresh_token");
      await deleteItem("login_approved");
    } catch (e) {
      console.error("Logout cleanup failed:", e);
    } finally {
      set({
        ...initialState,
        isLoading: false,
      });
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),

  hasCapability: (capability: string): boolean => {
    const state = get();
    return hasCapability(state.user, capability);
  },

  updateUserCapabilities: (capabilities: string[]) => {
    set((state) => ({
      user: state.user ? { ...state.user, capabilities } : null,
    }));
  },

  initializeAuth: async () => {
    console.log('🔧 initializeAuth: Starting...');
    set({ isLoading: true });

    try {
      // Check for force reset first
      console.log('🔧 initializeAuth: Checking forceReset...');
      const forceReset = process.env.EXPO_PUBLIC_RESET_LOGIN_ON_START === 'true' || 
                        process.env.EXPO_PUBLIC_RESET_LOGIN_ON_START === '1';
      
      if (forceReset) {
        console.log('🔧 initializeAuth: Force resetting auth state...');
        try {
          await deleteItem('auth_token');
          await deleteItem('refresh_token');
          await deleteItem('login_approved');
        } catch (e) {
          console.error('🔧 initializeAuth: Error during force reset:', e);
        }
        set({ ...initialState, isLoading: false });
        return;
      }

      // Get stored tokens with timeout
      console.log('🔧 initializeAuth: Getting stored tokens...');
      const [token, refreshToken, approved] = await Promise.all([
        getItem('auth_token'),
        getItem('refresh_token'),
        getItem('login_approved')
      ]);

      console.log('🔧 initializeAuth: Got tokens:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        approved
      });

      // Check environment flags
      const requireOtpOnStart = process.env.EXPO_PUBLIC_REQUIRE_OTP_ON_START === 'true' || 
                               process.env.EXPO_PUBLIC_REQUIRE_OTP_ON_START === '1';
      const bypassOtp = process.env.EXPO_PUBLIC_BYPASS_OTP === 'true' || 
                       process.env.EXPO_PUBLIC_BYPASS_OTP === '1';

      console.log('🔧 initializeAuth: Environment variables:', {
        requireOtpOnStart,
        bypassOtp,
        EXPO_PUBLIC_WEB_RESET_ON_LOAD: process.env.EXPO_PUBLIC_WEB_RESET_ON_LOAD,
        hasApiKey: !!process.env.EXPO_PUBLIC_BUILDER_API_KEY
      });

      // Only restore session if user had explicitly approved login previously
      if (token && approved === 'true' && !requireOtpOnStart) {
        console.log('🔧 initializeAuth: Session appears valid, fetching profile...');
        try {
          const { authService } = await import('../../services/auth');
          const profileResp = await withTimeout(
            authService.getProfile(),
            8000,
            'Profile fetch timeout'
          );

          console.log('🔧 initializeAuth: Profile fetch complete:', 
            profileResp.success ? 'SUCCESS' : 'FAILED');

          if (profileResp.success && profileResp.data) {
            console.log('🔧 initializeAuth: Setting authenticated state with profile');
            // Map API response to our User type
            const user: User = {
              id: profileResp.data.id,
              unique_id: profileResp.data.id,
              email: profileResp.data.email,
              name: profileResp.data.name,
              phone: profileResp.data.phone,
              is_active: true,
              capabilities: profileResp.data.capabilities || [],
              created_at: profileResp.data.createdAt,
              updated_at: profileResp.data.updatedAt,
              // Legacy fields
              isVerified: profileResp.data.isVerified,
              createdAt: profileResp.data.createdAt,
              updatedAt: profileResp.data.updatedAt
            };
            set({
              user,
              token,
              refreshToken,
              approved: true,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            const unauthorized = (profileResp.error || '').toLowerCase().includes('unauthorized') || 
                               (profileResp as any).status === 401;
            console.log('🔧 initializeAuth: Profile fetch failed:', 
              unauthorized ? 'UNAUTHORIZED' : 'OTHER_ERROR');

            if (unauthorized) {
              console.log('🔧 initializeAuth: Clearing invalid session');
              await deleteItem('auth_token');
              await deleteItem('refresh_token');
              set({ ...initialState, isLoading: false });
            } else {
              console.log('🔧 initializeAuth: Keeping session for retry');
              set({
                user: null,
                token,
                refreshToken,
                approved: true,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          }
        } catch (err) {
          console.log('🔧 initializeAuth: Error during profile fetch:', err);
          set({
            user: null,
            token,
            refreshToken,
            approved: true,
            isAuthenticated: true,
            isLoading: false,
            error: 'Failed to fetch user profile'
          });
        }
      } else {
        console.log('🔧 initializeAuth: No valid session found');
        try { await deleteItem('login_approved'); } catch {}
        set({ ...initialState, isLoading: false });
      }
    } catch (e) {
      console.error('🔧 initializeAuth: Failed:', e);
      set({ ...initialState, isLoading: false, error: 'Failed to initialize auth' });
    }
  }
}));