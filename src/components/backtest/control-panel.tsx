"use client";

import React, { useState } from "react";
import { 
  Play, 
  StepForward, 
  RotateCcw, 
  Settings2,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const [lotSize, setLotSize] = useState("1.00");
  const [spread, setSpread] = useState("0");
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--surface-primary)]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[var(--text-muted)]" />
          Execution Panel
        </h3>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Connected
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--text-muted)] font-medium">Lot Size</label>
          <input 
            type="number" 
            value={lotSize}
            onChange={(e) => setLotSize(e.target.value)}
            step="0.01"
            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-[var(--text-muted)] font-medium">Spread (pts)</label>
          <input 
            type="number" 
            value={spread}
            onChange={(e) => setSpread(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-2">
        <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors font-medium">
          <TrendingDown className="w-4 h-4" />
          Sell
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 transition-colors font-medium">
          <TrendingUp className="w-4 h-4" />
          Buy
        </button>
      </div>

      <div className="border-t border-[var(--border-primary)] pt-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(
                "p-2 rounded-lg transition-colors border",
                isPlaying 
                  ? "bg-[var(--brand-primary)]/20 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]" 
                  : "bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <Play className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <StepForward className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {isPlaying ? "Running (1x)" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
}
