"use client";

import React from "react";
import { Trade } from "@/types";
import { motion } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import { Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface GlassCardProps {
  trade: Trade;
  onClick: () => void;
  onDelete?: () => void;
}

export function GlassCard({ trade, onClick, onDelete }: GlassCardProps) {
  const isWin = trade.pnl > 0;

  // Placeholder gradient based on trade ID
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
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="relative w-full aspect-[16/10] min-h-[220px] rounded-2xl overflow-hidden cursor-pointer group border border-white/[0.06] bg-[#0c0d14] shadow-lg hover:shadow-2xl hover:border-white/20 transition-all flex flex-col justify-between"
      onClick={onClick}
    >
      {/* Background Image / Screenshot */}
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

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 pointer-events-none" />

      {/* Top Header Row (Asset, Direction & Delete Button) */}
      <div className="relative z-10 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-white px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            {trade.asset}
          </span>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md flex items-center gap-0.5",
              trade.direction === "long"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
            )}
          >
            {trade.direction === "long" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trade.direction.toUpperCase()}
          </span>
        </div>

        {/* Delete Image Button */}
        {onDelete && (
          <button
            title="ลบภาพนี้ (Delete image)"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all opacity-80 group-hover:opacity-100 cursor-pointer shadow-sm"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Bottom Bar: P&L, Session & Date */}
      <div className="relative z-10 p-3.5">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
              <span>{new Date(trade.openTime).toLocaleDateString()}</span>
              {trade.session && (
                <>
                  <span>·</span>
                  <span className="uppercase">{trade.session}</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
              R:R {trade.riskReward} · {trade.lotSize} lots
            </div>
          </div>

          <div
            className={cn(
              "text-base font-bold font-mono tracking-tight",
              isWin ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {formatCurrency(trade.pnl)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
