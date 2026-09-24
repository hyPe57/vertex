"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn, calculateRR, getEmotionLabel, getEmotionColor } from "@/lib/utils";
import { mockTags } from "@/lib/mock-data";
import { UploadCloud, Zap, X, Plus, Tag as TagIcon } from "lucide-react";

const emotionColors = [
  "bg-rose-500/80",
  "bg-amber-500/80",
  "bg-yellow-400/80",
  "bg-emerald-400/80",
  "bg-teal-400/80",
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

  // Tag management matching History edit drawer
  const [selectedTags, setSelectedTags] = useState<string[]>(["Breakout"]);
  const [availableTags, setAvailableTags] = useState<string[]>(
    mockTags.map((t) => t.name)
  );
  const [newTagInput, setNewTagInput] = useState("");

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

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, "");
    if (!trimmed) return;
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
              <Zap size={13} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">
                Quick Log
              </h2>
              <p className="text-[11px] text-neutral-400">Fast trade recording</p>
            </div>
          </div>
          {rr && (
            <span className="text-[10px] font-semibold tabular-nums px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              RR 1:{rr}
            </span>
          )}
        </div>

        {/* 1. TRADING MOOD */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
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
          <div className="flex h-6 rounded-lg overflow-hidden border border-white/[0.05] bg-white/[0.02]">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEmotion(level)}
                className={cn(
                  "flex-1 transition-all duration-150 cursor-pointer",
                  emotionColors[level - 1],
                  emotion === level
                    ? "opacity-100 shadow-inner"
                    : emotion
                    ? "opacity-20 hover:opacity-60"
                    : "opacity-35 hover:opacity-75"
                )}
              />
            ))}
          </div>
        </div>

        {/* 2. Asset & Direction Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Asset
            </label>
            <div className="relative">
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                placeholder="XAUUSD"
                className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors uppercase tabular-nums"
              />
              {!asset && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500 pointer-events-none">
                  Last: XAUUSD
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Direction
            </label>
            <div className="flex h-8 rounded-xl p-0.5 bg-white/[0.025] border border-white/[0.05]">
              <button
                type="button"
                onClick={() => setDirection("long")}
                className={cn(
                  "flex-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  direction === "long"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                Long
              </button>
              <button
                type="button"
                onClick={() => setDirection("short")}
                className={cn(
                  "flex-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  direction === "short"
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/25 shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                Short
              </button>
            </div>
          </div>
        </div>

        {/* 3. Entry & Exit Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Entry Price
            </label>
            <input
              type="number"
              step="any"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="2650.50"
              className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Exit Price
            </label>
            <input
              type="number"
              step="any"
              value={exit}
              onChange={(e) => setExit(e.target.value)}
              placeholder="2668.20"
              className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors tabular-nums"
            />
          </div>
        </div>

        {/* 4. Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Stop Loss (SL)
            </label>
            <input
              type="number"
              step="any"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              placeholder="2642.00"
              className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Take Profit (TP)
            </label>
            <input
              type="number"
              step="any"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              placeholder="2670.00"
              className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors tabular-nums"
            />
          </div>
        </div>

        {/* 5. Lot Size & Auto RR Summary */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              Lot Size
            </label>
            <input
              type="number"
              step="0.01"
              value={lotSize}
              onChange={(e) => setLotSize(e.target.value)}
              placeholder="0.50"
              className="w-full h-8 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors tabular-nums"
            />
          </div>
          <div className="h-8 flex items-center justify-between px-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] font-medium text-neutral-400">Auto RR</span>
            <span className="text-xs font-semibold tabular-nums text-neutral-200">
              {rr ? `1:${rr}` : "—"}
            </span>
          </div>
        </div>

        {/* 6. TAGS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <TagIcon size={11} className="text-neutral-400" />
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Tags
              </label>
            </div>
            {selectedTags.length > 0 && (
              <span className="text-[10px] text-neutral-500 tabular-nums">
                {selectedTags.length} selected
              </span>
            )}
          </div>

          {/* Active Tags with Delete 'X' */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium bg-white/[0.04] text-neutral-200 border border-white/[0.08]"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 text-neutral-400 p-0.5 transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add New Tag Input matching History Drawer */}
          <div className="flex items-center gap-1.5 mb-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add tag and press Enter..."
              className="flex-1 h-7.5 bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTagInput.trim()}
              className="h-7.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-200 border border-white/[0.08] text-xs font-semibold flex items-center gap-1 disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus size={11} />
              <span>Add</span>
            </button>
          </div>

          {/* Tag Quick Suggestions */}
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tagName) => {
              const isSelected = selectedTags.includes(tagName);
              return (
                <button
                  key={tagName}
                  type="button"
                  onClick={() => toggleTag(tagName)}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-150 border cursor-pointer",
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-semibold"
                      : "border-white/[0.035] bg-white/[0.015] text-neutral-400 hover:border-white/[0.08] hover:text-neutral-200"
                  )}
                >
                  #{tagName}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Notes */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Trade reasoning, confluence, or mistakes..."
            className="w-full bg-white/[0.025] border border-white/[0.05] hover:border-white/[0.08] focus:border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        {/* Screenshot Upload Dropzone */}
        <div>
          <div className="border border-dashed border-white/[0.06] hover:border-white/20 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer bg-white/[0.015]">
            <UploadCloud size={15} className="opacity-70" />
            <span className="text-[11px]">Drop chart screenshot here</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="w-full h-9 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
        >
          Submit Trade Log
        </button>
      </div>
    </motion.div>
  );
}
