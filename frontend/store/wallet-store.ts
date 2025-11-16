import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface WalletAccount {
  id: string
  address: string
  name: string
  email: string
  avatar?: string
  firstLoginTime: number
}

export interface Chain {
  id: string
  name: string
  icon: string
  nativeToken: string
  rpcUrl?: string
  blockExplorer?: string
}

export interface Transaction {
  id: string
  hash: string
  from: string
  to?: string
  amount: string
  token: string
  type: "send" | "receive" | "swap"
  status: "pending" | "success" | "failed"
  timestamp: number
  gasSponsored?: boolean
  chainId: string
}

export interface WalletSettings {
  displayName: string
  analyticsOptIn: boolean
  autoSponsor: boolean
  slippageTolerance: number
  selectedRelayer: "mock" | "pimlico" | "stackup"
  developerMode: boolean
  defaultGasStrategy: "fast" | "standard" | "slow"
}

interface WalletStore {
  // Auth & Account
  account: WalletAccount | null
  isAuthenticated: boolean
  setAccount: (account: WalletAccount | null) => void
  setAuthenticated: (auth: boolean) => void

  // Chain & Network
  activeChain: string
  setActiveChain: (chainId: string) => void

  // Balances (mocked per chain)
  balances: Record<string, Record<string, string>> // chainId => { tokenSymbol => amount }
  setBalances: (chainId: string, balances: Record<string, string>) => void
  balancesLoading: boolean
  setBalancesLoading: (loading: boolean) => void

  // Transactions
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  setTransactions: (transactions: Transaction[]) => void

  // Settings
  settings: WalletSettings
  updateSettings: (updates: Partial<WalletSettings>) => void
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      account: null,
      isAuthenticated: false,
      activeChain: "84532", // Default to Base Sepolia
      balances: {},
      balancesLoading: false,
      transactions: [],
      settings: {
        displayName: "",
        analyticsOptIn: false,
        autoSponsor: true,
        slippageTolerance: 0.5,
        selectedRelayer: "mock",
        developerMode: false,
        defaultGasStrategy: "standard",
      },

      setAccount: (account) => set({ account }),
      setAuthenticated: (auth) => set({ isAuthenticated: auth }),
      setActiveChain: (chainId) => set({ activeChain: chainId }),
      setBalances: (chainId, balances) =>
        set((state) => ({
          balances: {
            ...state.balances,
            [chainId]: balances,
          },
        })),
      setBalancesLoading: (loading) => set({ balancesLoading: loading }),
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)),
        })),
      setTransactions: (transactions) => set({ transactions }),
      updateSettings: (updates) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...updates,
          },
        })),
    }),
    {
      name: "kivo-wallet-store",
    },
  ),
)
