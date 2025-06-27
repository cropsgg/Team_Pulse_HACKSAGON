import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'ADMIN' | 'MEMBER';
  profile?: {
    displayName?: string;
    bio?: string;
    avatar?: string;
    walletAddress?: string;
  };
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string | null, refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  needsRefresh: () => boolean;
}

const decodeToken = (token: string): { exp: number } | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      
      setTokens: (accessToken, refreshToken) => set({ 
        accessToken, 
        refreshToken,
        isAuthenticated: !!accessToken 
      }),
      
      setUser: (user) => set({ user }),
      
      login: (accessToken, refreshToken, user) => set({ 
        accessToken, 
        refreshToken,
        user, 
        isAuthenticated: true 
      }),
      
      logout: () => set({ 
        accessToken: null, 
        refreshToken: null,
        user: null, 
        isAuthenticated: false 
      }),
      
      needsRefresh: () => {
        const { accessToken } = get();
        if (!accessToken) return false;
        
        const decoded = decodeToken(accessToken);
        if (!decoded) return true;
        
        // Refresh if token expires in less than 2 minutes
        const now = Date.now() / 1000;
        return decoded.exp - now < 120;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        refreshToken: state.refreshToken, 
        user: state.user 
      }),
      // Only enable persistence in browser environment
      storage: isBrowser ? undefined : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      },
    }
  )
); 