"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn, calculateRR, getEmotionLabel, getEmotionColor } from "@/lib/utils";
import { mockTags } from "@/lib/mock-data";
import { Card, Button } from "@/components/ui";
import { UploadCloud, Zap } from "lucide-react";

const emotionColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-emerald-500",
];

export function QuickLog() {
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [emotion, setEmotion] = useState<number | null>(4);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Breakout"]);

  const rr =
    entry && sl && tp && direction
      ? calculateRR(
          parseFloat(entry),
          parseFloat(sl),
          parseFloat(tp),
          direction
        )
      : null;

  const toggleTag = (name: string) => {
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="w-full"
    >
      <Card className="p-5 glass-card flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]/50">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-brand-500/10 text-brand-500">
              <Zap size={14} />
            </div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Quick Log
            </h2>
          </div>
          {rr && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
              RR 1:{rr}
            </span>
          )}
        </div>

        {/* Asset & Direction Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Asset
            </label>
            <div className="relative">
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="XAUUSD"
                className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-brand-500 transition-colors uppercase"
              />
              {!asset && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)] italic pointer-events-none">
                  Last: XAUUSD
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Direction
            </label>
            <div className="flex h-8 rounded-lg p-0.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
              <button
                type="button"
                onClick={() => setDirection("long")}
                className={cn(
                  "flex-1 rounded-md text-xs font-semibold transition-all",
                  direction === "long"
                    ? "bg-profit/20 text-profit shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setDirection("short")}
                className={cn(
                  "flex-1 rounded-md text-xs font-semibold transition-all",
                  direction === "short"
                    ? "bg-loss/20 text-loss shadow-xs"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                )}
              >
                Short
              </button>
            </div>
          </div>
        </div>

        {/* Entry & Exit Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Entry Price
            </label>
            <input
              type="number"
              step="any"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="2650.50"
              className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Exit Price
            </label>
            <input
              type="number"
              step="any"
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              placeholder="2668.20"
              className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Stop Loss (SL)
            </label>
            <input
              type="number"
              step="any"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              placeholder="2642.00"
              className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Take Profit (TP)
            </label>
            <input
              type="number"
              step="any"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              placeholder="2670.00"
              className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
        </div>

        {/* Lot Size & Auto RR Summary */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
              Lot Size
            </label>
            <input
              type="number"
              step="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="0.50"
              className="w-full h-8 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div className="h-8 flex items-center justify-between px-2.5 rounded-lg bg-brand-500/5 border border-brand-500/20">
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">Auto RR</span>
            <span className="text-xs font-bold font-mono text-brand-400">
              {rr ? `1:${rr}` : "—"}
            </span>
          </div>
        </div>

        {/* Emotion Gauge */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Trading Mood
            </label>
            {emotion && (
              <span
                className="text-[11px] font-medium"
                style={{ color: getEmotionColor(emotion) }}
              >
                {getEmotionLabel(emotion)}
              </span>
            )}
          </div>
          <div className="flex h-7 rounded-lg overflow-hidden border border-[var(--border-primary)]">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEmotion(level)}
                className={cn(
                  "flex-1 transition-all duration-150",
                  emotionColors[level - 1],
                  emotion === level
                    ? "opacity-100 shadow-inner"
                    : emotion
                    ? "opacity-25 hover:opacity-60"
                    : "opacity-40 hover:opacity-75"
                )}
              />
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5">
            {mockTags.slice(0, 6).map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium transition-all duration-150 border",
                  selectedTags.includes(tag.name)
                    ? "border-brand-500/50 bg-brand-500/15 text-brand-400"
                    : "border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:border-[var(--text-tertiary)]"
                )}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Trade reasoning, confluence, or mistakes..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-brand-500 transition-colors resize-none"
          />
        </div>

        {/* Screenshot Upload Dropzone */}
        <div>
          <div className="border border-dashed border-[var(--border-primary)] rounded-lg py-2.5 px-3 flex items-center justify-center gap-2 text-[var(--text-tertiary)] hover:border-brand-500/40 hover:text-brand-500 transition-colors cursor-pointer bg-[var(--bg-secondary)]/50">
            <UploadCloud size={16} className="opacity-70" />
            <span className="text-[11px]">Drop chart screenshot here</span>
          </div>
        </div>

        {/* Submit */}
        <Button size="md" className="w-full mt-1">
          Submit Trade Log
        </Button>
      </Card>
    </motion.div>
  );
}
