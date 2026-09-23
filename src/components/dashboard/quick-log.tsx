"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn, calculateRR, getEmotionLabel, getEmotionColor } from "@/lib/utils";
import { mockTags } from "@/lib/mock-data";
import { Card, Button } from "@/components/ui";
import { UploadCloud, X } from "lucide-react";

const emotionColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-emerald-500",
];

export function QuickLog() {
  const [asset, setAsset] = useState("");
  const [direction, setDirection] = useState<"long" | "short" | null>(null);
  const [entry, setEntry] = useState("");
  const [exit, setExit] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [emotion, setEmotion] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-5">
          Quick Log
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Trade Details */}
          <div className="space-y-4">
            {/* Asset */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Asset
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={asset}
                  onChange={(e) => setAsset(e.target.value)}
                  placeholder="e.g. XAUUSD"
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
                {!asset && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)] italic pointer-events-none">
                    Last: XAUUSD
                  </span>
                )}
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDirection("long")}
                  className={cn(
                    "flex-1 h-9 rounded-full text-sm font-medium transition-all duration-200 border",
                    direction === "long"
                      ? "bg-profit/15 text-profit border-profit/40"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-profit/30"
                  )}
                >
                  Long
                </button>
                <button
                  onClick={() => setDirection("short")}
                  className={cn(
                    "flex-1 h-9 rounded-full text-sm font-medium transition-all duration-200 border",
                    direction === "short"
                      ? "bg-loss/15 text-loss border-loss/40"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-loss/30"
                  )}
                >
                  Short
                </button>
              </div>
            </div>

            {/* Entry / Exit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={entry}
                  onChange={(e) => setEntry(e.target.value)}
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Exit Price
                </label>
                <input
                  type="number"
                  step="any"
                  value={exit}
                  onChange={(e) => setExit(e.target.value)}
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* SL / TP */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Stop Loss
                </label>
                <input
                  type="number"
                  step="any"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Take Profit
                </label>
                <input
                  type="number"
                  step="any"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Auto RR + Lot Size */}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Lot Size
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  placeholder="0.50"
                  className="w-full h-9 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 text-sm font-mono text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>
              <div className="h-9 flex items-center justify-between px-3 rounded-lg bg-brand-500/5 border border-brand-500/20">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Auto RR
                </span>
                <span className="text-sm font-bold font-mono text-brand-500">
                  {rr ? `1:${rr}` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Emotion, Tags, Notes, Image */}
          <div className="space-y-4">
            {/* Emotion Gauge */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Trading Mood
                {emotion && (
                  <span
                    className="ml-2 font-normal"
                    style={{ color: getEmotionColor(emotion) }}
                  >
                    {getEmotionLabel(emotion)}
                  </span>
                )}
              </label>
              <div className="flex h-9 rounded-lg overflow-hidden border border-[var(--border-primary)]">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setEmotion(level)}
                    className={cn(
                      "flex-1 transition-all duration-200",
                      emotionColors[level - 1],
                      emotion === level
                        ? "opacity-100 shadow-inner"
                        : emotion
                        ? "opacity-20 hover:opacity-50"
                        : "opacity-30 hover:opacity-60"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {mockTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 border",
                      selectedTags.includes(tag.name)
                        ? "border-brand-500/40 bg-brand-500/10 text-brand-400"
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
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What went well? What could be improved?"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Chart Screenshot
              </label>
              <div className="border-2 border-dashed border-[var(--border-primary)] rounded-lg p-5 flex flex-col items-center justify-center text-[var(--text-tertiary)] hover:border-brand-500/40 hover:text-brand-500 transition-colors cursor-pointer bg-[var(--bg-secondary)]/50">
                <UploadCloud size={24} className="mb-1.5 opacity-60" />
                <span className="text-xs">Drag & drop or click to upload</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button size="lg">Submit Trade Log</Button>
        </div>
      </Card>
    </motion.div>
  );
}
