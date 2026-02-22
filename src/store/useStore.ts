import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface UserState {
    user: any;
    wallet: any;
    loans: any[];
    transactions: any[];
    lastUpdated: number;
    navigationStack: string[];
    setUser: (user: any) => void;
    setWallet: (wallet: any) => void;
    setLoans: (loans: any[]) => void;
    setTransactions: (transactions: any[]) => void;
    pushToStack: (path: string) => void;
    popFromStack: () => void;
    clearStack: () => void;
    clearStore: () => void;
}

export const useStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            wallet: null,
            loans: [],
            transactions: [],
            lastUpdated: 0,
            navigationStack: [],
            setUser: (user) => set({ user, lastUpdated: Date.now() }),
            setWallet: (wallet) => set({ wallet, lastUpdated: Date.now() }),
            setLoans: (loans) => set({ loans, lastUpdated: Date.now() }),
            setTransactions: (transactions) => set({ transactions, lastUpdated: Date.now() }),
            pushToStack: (path) => set((state) => {
                // Don't push if same as last
                if (state.navigationStack[state.navigationStack.length - 1] === path) return state;
                const newStack = [...state.navigationStack, path].slice(-10); // Keep last 10
                return { navigationStack: newStack };
            }),
            popFromStack: () => set((state) => ({
                navigationStack: state.navigationStack.slice(0, -1)
            })),
            clearStack: () => set({ navigationStack: [] }),
            clearStore: () => set({ user: null, wallet: null, loans: [], transactions: [], lastUpdated: 0, navigationStack: [] }),
        }),
        {
            name: 'openscore-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
