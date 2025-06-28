import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Wallet specific state
  walletAddress: string | null;
  isWalletConnected: boolean;
  chainId: number | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWalletInfo: (address: string | null, chainId: number | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        walletAddress: null,
        isWalletConnected: false,
        chainId: null,

        setUser: (user) => {
          set({ 
            user, 
            isAuthenticated: !!user,
            error: null 
          });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        setError: (error) => {
          set({ error });
        },

        setWalletInfo: (address, chainId) => {
          set({ 
            walletAddress: address,
            isWalletConnected: !!address,
            chainId 
          });
        },

        login: (user) => {
          set({ 
            user,
            isAuthenticated: true,
            error: null 
          });
        },

        logout: () => {
          set({ 
            user: null,
            isAuthenticated: false,
            walletAddress: null,
            isWalletConnected: false,
            chainId: null,
            error: null 
          });
        },

        updateUser: (updates) => {
          const currentUser = get().user;
          if (currentUser) {
            set({ 
              user: { ...currentUser, ...updates } 
            });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          walletAddress: state.walletAddress,
          isWalletConnected: state.isWalletConnected,
          chainId: state.chainId,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

export default useAuthStore; 