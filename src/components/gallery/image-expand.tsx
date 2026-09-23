"use client";

import React, { useEffect } from "react";
import { Trade } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge, StatBox } from "@/components/ui";
import { X } from "lucide-react";

interface ImageExpandProps {
  trade: Trade | null;
  onClose: () => void;
}

export function ImageExpand({ trade, onClose }: ImageExpandProps) {
  // Prevent scrolling when open
  useEffect(() => {
    if (trade) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [trade]);

  if (!trade) return null;

  const isWin = trade.pnl > 0;
  
  // Same background generation logic for the placeholder
  const hash = trade.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 2) % 360;
  
  const backgroundStyle = {
    background: `linear-gradient(135deg, hsl(${hue1}, 20%, 20%), hsl(${hue2}, 30%, 15%))`,
    backgroundImage: `
      linear-gradient(135deg, hsl(${hue1}, 20%, 20%), hsl(${hue2}, 30%, 15%)),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px),
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 40px)
    `
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl max-h-[85vh] bg-[var(--bg-primary)] rounded-2xl shadow-2xl border border-[var(--border-primary)] overflow-hidden flex flex-col lg:flex-row z-10"
        >
          {/* Image Section */}
          <div className="flex-1 relative min-h-[40vh] lg:min-h-0 bg-[var(--bg-secondary)] overflow-hidden group">
            <div className="absolute inset-0" style={backgroundStyle} />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-40 mix-blend-overlay">
              <svg viewBox="0 0 100 50" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <polyline 
                  points="0,40 20,30 40,35 60,15 80,25 100,5" 
                  fill="none" 
                  stroke={isWin ? "#22c55e" : "#ef4444"} 
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-4 left-4 lg:hidden p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Details Sidebar */}
          <div className="w-full lg:w-96 flex flex-col h-full max-h-[50vh] lg:max-h-none overflow-y-auto border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] bg-[var(--bg-primary)]">
            <div className="sticky top-0 bg-[var(--bg-primary)] z-10 flex items-center justify-between p-5 border-b border-[var(--border-primary)]">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{trade.asset}</h2>
                <div className="text-sm text-[var(--text-tertiary)]">
                  {new Date(trade.openTime).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={onClose}
                className="hidden lg:flex p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-surface-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* PnL Highlight */}
              <div className="glass-card bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--border-primary)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Net PnL</span>
                  <Badge variant={trade.direction === "long" ? "brand" : "default"}>
                    {trade.direction.toUpperCase()}
                  </Badge>
                </div>
                <div className={cn(
                  "text-3xl font-mono font-semibold",
                  isWin ? "text-profit" : "text-loss"
                )}>
                  {isWin ? "+" : ""}${Math.abs(trade.pnl).toFixed(2)}
                </div>
              </div>

              {/* Grid Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatBox label="Entry" value={trade.entryPrice.toString()} />
                <StatBox label="Exit" value={trade.exitPrice?.toString() || "-"} />
                <StatBox label="R:R" value={trade.riskReward.toString()} />
                <StatBox label="Lot Size" value={trade.lotSize.toString()} />
              </div>

              {/* Tags */}
              {trade.tags && trade.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {trade.tags.map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotion */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Emotion Level</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level}
                      className={cn(
                        "flex-1 h-2 rounded-full",
                        level <= trade.emotionLevel 
                          ? "bg-brand-500" 
                          : "bg-surface-200 dark:bg-surface-700"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
                    {trade.emotionLevel}/5
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">Notes</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-primary)]">
                  {trade.notes || "No notes provided for this trade."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
