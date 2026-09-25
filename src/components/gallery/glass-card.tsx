"use client";

import React from "react";
import { Trade } from "@/types";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface GlassCardProps {
  trade: Trade;
  onClick: () => void;
  onDelete?: () => void;
}

export function GlassCard({ trade, onClick, onDelete }: GlassCardProps) {
  const isWin = trade.pnl > 0;

  // Placeholder gradient based on trade ID if no image
  const hash = trade.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 2) % 360;

  const backgroundStyle = {
    background: `linear-gradient(135deg, hsl(${hue1}, 20%, 18%), hsl(${hue2}, 30%, 12%))`,
    backgroundImage: `
      linear-gradient(135deg, hsl(${hue1}, 20%, 18%), hsl(${hue2}, 30%, 12%)),
      repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 20px)
    `,
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative w-full aspect-[16/10] rounded-xl overflow-hidden cursor-pointer group border border-white/[0.07] bg-[#0c0d14] shadow-sm hover:shadow-xl hover:border-white/20 transition-all flex flex-col justify-between"
      onClick={onClick}
    >
      {/* Background Chart Screenshot */}
      {trade.images && trade.images.length > 0 && trade.images[0].imageUrl ? (
        <img
          src={trade.images[0].imageUrl}
          alt={trade.asset}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <>
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={backgroundStyle}
          />
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
        </>
      )}

      {/* Subtle soft dark vignette overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 opacity-70 group-hover:opacity-90 transition-opacity pointer-events-none" />

      {/* Top Bar: Asset Symbol + Direction Tag + Delete Icon */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-[11px] text-white px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 shadow-xs">
            {trade.asset}
          </span>
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md backdrop-blur-md border shadow-xs",
              trade.direction === "long"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border-rose-500/30"
            )}
          >
            {trade.direction.toUpperCase()}
          </span>
        </div>

        {/* Delete Image on Hover */}
        {onDelete && (
          <button
            title="ลบรูปภาพนี้"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 rounded-md bg-black/70 hover:bg-rose-500 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-xs"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Bottom Bar: Clean Original Glassmorphic Badge */}
      <div className="relative z-10 p-2.5 flex items-center justify-between">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] font-mono text-neutral-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
            {new Date(trade.openTime).toLocaleDateString()}
          </span>
        </div>

        <div className="bg-black/75 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-md ml-auto">
          {trade.riskReward ? (
            <span className="text-[10px] text-neutral-400 font-mono font-medium">
              1:{trade.riskReward}
            </span>
          ) : null}
          <span
            className={cn(
              "font-mono font-bold text-xs tracking-tight",
              isWin ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {formatCurrency(trade.pnl)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
