import { create } from "zustand";
import type { Theme, CurrencyDisplay, Trade, Port } from "@/types";
import { mockTrades, mockPorts } from "@/lib/mock-data";

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
  ports: Port[];
  activePortId: string | null;
  setActivePort: (id: string) => void;
  addPort: (portData: Omit<Port, "id" | "currentBalance" | "syncStatus" | "isActive"> & { currentBalance?: number }) => Port;
  updatePort: (id: string, updated: Partial<Port>) => void;
  deletePort: (id: string) => void;
  syncPort: (id: string) => Promise<void>;
  portSelectorOpen: boolean;
  setPortSelectorOpen: (open: boolean) => void;
  togglePortSelector: () => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingPort: Port | null;
  setEditingPort: (port: Port | null) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

export const usePortStore = create<PortState>((set) => ({
  ports: mockPorts,
  activePortId: "port-1",
  setActivePort: (id) => set({ activePortId: id }),
  addPort: (portData) => {
    const newPort: Port = {
      id: `port-${Date.now()}`,
      name: portData.name,
      platform: portData.platform,
      initialBalance: Number(portData.initialBalance) || 10000,
      currentBalance: Number(portData.currentBalance ?? portData.initialBalance) || 10000,
      syncStatus: "connected",
      isActive: true,
      accountNumber: portData.accountNumber,
      brokerServer: portData.brokerServer,
      lastSyncedAt: new Date().toISOString(),
    };
    set((state) => ({
      ports: [newPort, ...state.ports],
      activePortId: newPort.id,
      portSelectorOpen: false,
      isAddModalOpen: false,
    }));
    return newPort;
  },
  updatePort: (id, updated) =>
    set((state) => ({
      ports: state.ports.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    })),
  deletePort: (id) =>
    set((state) => {
      const remaining = state.ports.filter((p) => p.id !== id);
      const nextActiveId =
        state.activePortId === id ? (remaining[0]?.id || null) : state.activePortId;
      return {
        ports: remaining,
        activePortId: nextActiveId,
      };
    }),
  syncPort: async (id) => {
    set((state) => ({
      ports: state.ports.map((p) =>
        p.id === id ? { ...p, syncStatus: "syncing" } : p
      ),
    }));
    await new Promise((resolve) => setTimeout(resolve, 1200));
    set((state) => ({
      ports: state.ports.map((p) =>
        p.id === id
          ? {
              ...p,
              syncStatus: "connected",
              lastSyncedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
  },
  portSelectorOpen: false,
  setPortSelectorOpen: (open) => set({ portSelectorOpen: open }),
  togglePortSelector: () =>
    set((state) => ({ portSelectorOpen: !state.portSelectorOpen })),
  isAddModalOpen: false,
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  editingPort: null,
  setEditingPort: (port) => set({ editingPort: port, isEditModalOpen: !!port }),
  isEditModalOpen: false,
  setIsEditModalOpen: (open) => set({ isEditModalOpen: open, editingPort: open ? null : null }),
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
  deleteTradeImage: (tradeId: string, imageId?: string) => void;
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
  deleteTradeImage: (tradeId, imageId) =>
    set((state) => ({
      trades: state.trades.map((t) => {
        if (t.id !== tradeId) return t;
        if (!imageId) {
          return { ...t, images: [] };
        }
        return {
          ...t,
          images: t.images ? t.images.filter((img) => img.id !== imageId) : [],
        };
      }),
    })),
}));
