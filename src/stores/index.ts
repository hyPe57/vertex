import { create } from "zustand";
import type { Theme, CurrencyDisplay, Trade } from "@/types";
import { mockTrades } from "@/lib/mock-data";

// ─── Theme Store ───

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  setTheme: (theme) => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", next === "dark");
      }
      return { theme: next };
    }),
}));

// ─── Currency Display Store ───

interface CurrencyState {
  display: CurrencyDisplay;
  setDisplay: (display: CurrencyDisplay) => void;
  toggleDisplay: () => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  display: "usd",
  setDisplay: (display) => set({ display }),
  toggleDisplay: () =>
    set((state) => ({
      display: state.display === "usd" ? "percent" : "usd",
    })),
}));

// ─── Active Port Store ───

interface PortState {
  activePortId: string | null;
  setActivePort: (id: string) => void;
  portSelectorOpen: boolean;
  setPortSelectorOpen: (open: boolean) => void;
  togglePortSelector: () => void;
}

export const usePortStore = create<PortState>((set) => ({
  activePortId: "port-1",
  setActivePort: (id) => set({ activePortId: id }),
  portSelectorOpen: false,
  setPortSelectorOpen: (open) => set({ portSelectorOpen: open }),
  togglePortSelector: () =>
    set((state) => ({ portSelectorOpen: !state.portSelectorOpen })),
}));

// ─── Drawer Store ───

interface DrawerState {
  isOpen: boolean;
  content: string | null;
  data: Record<string, unknown> | null;
  openDrawer: (content: string, data?: Record<string, unknown>) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  content: null,
  data: null,
  openDrawer: (content, data = {}) => set({ isOpen: true, content, data }),
  closeDrawer: () => set({ isOpen: false, content: null, data: null }),
}));

// ─── Trade Store ───

interface TradeState {
  trades: Trade[];
  addTrade: (trade: Trade) => void;
  updateTrade: (id: string, updated: Partial<Trade>) => void;
  deleteTrade: (id: string) => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  trades: mockTrades,
  addTrade: (newTrade) =>
    set((state) => ({ trades: [newTrade, ...state.trades] })),
  updateTrade: (id, updated) =>
    set((state) => ({
      trades: state.trades.map((t) =>
        t.id === id ? { ...t, ...updated } : t
      ),
    })),
  deleteTrade: (id) =>
    set((state) => ({
      trades: state.trades.filter((t) => t.id !== id),
    })),
}));
