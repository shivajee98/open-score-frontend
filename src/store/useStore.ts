import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
    user: any;
    wallet: any;
    loans: any[];
    lastUpdated: number;
    setUser: (user: any) => void;
    setWallet: (wallet: any) => void;
    setLoans: (loans: any[]) => void;
    clearStore: () => void;
}

export const useStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            wallet: null,
            loans: [],
            lastUpdated: 0,
            setUser: (user) => set({ user, lastUpdated: Date.now() }),
            setWallet: (wallet) => set({ wallet, lastUpdated: Date.now() }),
            setLoans: (loans) => set({ loans, lastUpdated: Date.now() }),
            clearStore: () => set({ user: null, wallet: null, loans: [], lastUpdated: 0 }),
        }),
        {
            name: 'openscore-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
