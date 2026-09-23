"use client";

import React from "react";
import { Trade } from "@/types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  trade: Trade;
  onClick: () => void;
}

export function GlassCard({ trade, onClick }: GlassCardProps) {
  const isWin = trade.pnl > 0;

  // Since we don't have real images, we'll generate a consistent pseudo-random gradient based on trade ID
  const hash = trade.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 2) % 360;
  
  const backgroundStyle = {
    background: `linear-gradient(135deg, hsl(${hue1}, 20%, 20%), hsl(${hue2}, 30%, 15%))`,
    // Adding some fake chart lines via CSS
    backgroundImage: `
      linear-gradient(135deg, hsl(${hue1}, 20%, 20%), hsl(${hue2}, 30%, 15%)),
      repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px)
    `
  };

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group border border-[var(--border-primary)] shadow-sm hover:shadow-lg dark:shadow-black/40"
      onClick={onClick}
    >
      <div 
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
        style={backgroundStyle}
      />
      
      {/* Decorative chart element placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 mix-blend-overlay">
        <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
          <polyline 
            points="0,40 20,30 40,35 60,15 80,25 100,5" 
            fill="none" 
            stroke={isWin ? "#22c55e" : "#ef4444"} 
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* Glassmorphism Tag Overlay */}
      <div className="absolute bottom-2.5 right-2.5">
        <div className="glass-card bg-surface-100/70 dark:bg-surface-900/70 backdrop-blur-md border border-[var(--border-primary)]/50 rounded-md px-2 py-1 flex items-center gap-2 shadow-sm">
          <span className="font-semibold text-xs text-[var(--text-primary)]">
            {trade.asset}
          </span>
          <span 
            className={cn(
              "font-mono font-medium text-xs",
              isWin ? "text-profit" : "text-loss"
            )}
          >
            {isWin ? "+" : ""}{trade.pnl > 0 ? trade.pnl : trade.pnl.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
