"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, calculateRR, getEmotionLabel, getEmotionColor } from "@/lib/utils";
import { mockTags } from "@/lib/mock-data";
import { useTradeStore } from "@/stores";
import type { Trade } from "@/types";
import {
  UploadCloud,
  Zap,
  X,
  Plus,
  Tag as TagIcon,
  Check,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";

interface AttachedImage {
  id: string;
  dataUrl: string;
  name: string;
  size: string;
}

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

  // Real Image Attachments State
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tag management - Clean minimal unified cloud
  const [selectedTags, setSelectedTags] = useState<string[]>(["Breakout"]);
  const [availableTags, setAvailableTags] = useState<string[]>(
    mockTags.map((t) => t.name)
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Process image files (File picker, Drag & Drop, Paste)
  const processFiles = (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArr.length === 0) return;

    fileArr.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) return;

        const sizeKB = file.size / 1024;
        const formattedSize =
          sizeKB > 1024
            ? `${(sizeKB / 1024).toFixed(1)} MB`
            : `${Math.round(sizeKB)} KB`;

        setAttachedImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            dataUrl,
            name: file.name || "screenshot.png",
            size: formattedSize,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Clipboard Paste Support (Ctrl+V / Cmd+V anywhere on window/component)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        processFiles(imageFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

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
    if (!trimmed) {
      setIsAddingTag(false);
      return;
    }
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setNewTagInput("");
    setIsAddingTag(false);
  };

  // Submit Trade Log with real attachments
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const entryNum = parseFloat(entry) || 2650.5;
    const exitNum = parseFloat(exit) || (direction === "long" ? entryNum + 15 : entryNum - 15);
    const slNum = parseFloat(sl) || (direction === "long" ? entryNum - 10 : entryNum + 10);
    const tpNum = parseFloat(tp) || (direction === "long" ? entryNum + 20 : entryNum - 20);
    const lots = parseFloat(lotSize) || 0.5;

    const diff = direction === "long" ? exitNum - entryNum : entryNum - exitNum;
    const calculatedPnl = Math.round(diff * lots * 100);

    const newTrade: Trade = {
      id: `trade-${Date.now()}`,
      portId: "port-1",
      asset: (asset || "XAUUSD").toUpperCase(),
      direction,
      lotSize: lots,
      entryPrice: entryNum,
      exitPrice: exitNum,
      stopLoss: slNum,
      takeProfit: tpNum,
      riskReward: rr ? parseFloat(rr.toString()) : 2.0,
      pnl: calculatedPnl,
      pnlPercent: parseFloat(((calculatedPnl / 10000) * 100).toFixed(2)),
      commission: -3.5,
      swap: 0,
      emotionLevel: emotion || 4,
      notes: notes || "Trade logged via QuickLog",
      session: "london",
      status: "closed",
      isBacktest: false,
      tags: selectedTags.length > 0 ? selectedTags : ["Manual"],
      images: attachedImages.map((img) => ({
        id: img.id,
        imageUrl: img.dataUrl,
        thumbnailUrl: img.dataUrl,
        caption: img.name,
      })),
      openTime: new Date(Date.now() - 3600000).toISOString(),
      closeTime: new Date().toISOString(),
    };

    useTradeStore.getState().addTrade(newTrade);

    // Show visual confirmation
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setAsset("");
      setEntry("");
      setExit("");
      setSl("");
      setTp("");
      setLotSize("");
      setNotes("");
      setAttachedImages([]);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="w-full"
    >
      <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col gap-4 relative">
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

        {/* 6. TAGS - Modern Minimal Unified Cloud */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TagIcon size={11} className="text-neutral-400" />
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                Tags
              </label>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-500 tabular-nums">
                  {selectedTags.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-[10px] text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Unified Fluid Tag Pills + Inline Add */}
          <div className="flex flex-wrap items-center gap-1.5">
            {availableTags.map((tagName) => {
              const isSelected = selectedTags.includes(tagName);
              return (
                <button
                  key={tagName}
                  type="button"
                  onClick={() => toggleTag(tagName)}
                  className={cn(
                    "group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 border cursor-pointer select-none",
                    isSelected
                      ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300 font-semibold shadow-xs"
                      : "border-white/[0.04] bg-white/[0.02] text-neutral-400 hover:border-white/[0.08] hover:text-neutral-200 hover:bg-white/[0.035]"
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                  <span>#{tagName}</span>
                  {isSelected && (
                    <span className="text-emerald-400/60 group-hover:text-emerald-300 ml-0.5 text-[10px]">
                      ✕
                    </span>
                  )}
                </button>
              );
            })}

            {/* Inline Add Tag Pill */}
            {isAddingTag ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/20 bg-white/[0.04]">
                <span className="text-neutral-500 text-[11px]">#</span>
                <input
                  autoFocus
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    } else if (e.key === "Escape") {
                      setIsAddingTag(false);
                      setNewTagInput("");
                    }
                  }}
                  onBlur={() => {
                    if (newTagInput.trim()) {
                      handleAddTag();
                    } else {
                      setIsAddingTag(false);
                    }
                  }}
                  placeholder="tag name..."
                  className="w-20 bg-transparent text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-400 hover:text-neutral-200 border border-dashed border-white/[0.08] hover:border-white/[0.2] bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer"
              >
                <Plus size={11} />
                <span>Tag</span>
              </button>
            )}
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

        {/* 8. Real Screenshot Upload Dropzone & Thumbnails */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Chart Screenshots
            </label>
            {attachedImages.length > 0 && (
              <span className="text-[10px] text-emerald-400 font-medium tabular-nums">
                {attachedImages.length} attached
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              if (e.target.files) processFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />

          {/* Interactive Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
            }}
            className={cn(
              "border border-dashed rounded-xl py-3 px-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none",
              isDragging
                ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
                : "border-white/[0.07] hover:border-white/20 bg-white/[0.015] hover:bg-white/[0.025] text-neutral-400 hover:text-neutral-200"
            )}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <UploadCloud size={16} className={isDragging ? "text-emerald-400" : "opacity-70"} />
              <span>
                Drop chart image or <span className="text-emerald-400 underline underline-offset-2">browse</span>
              </span>
            </div>
            <span className="text-[10px] text-neutral-500">
              Supports clipboard paste <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-neutral-400 font-mono text-[9px]">Ctrl+V</kbd>
            </span>
          </div>

          {/* Real Attached Image Thumbnails */}
          {attachedImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {attachedImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 aspect-video flex items-center justify-center"
                >
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                  />
                  {/* Hover Control Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-medium text-white/90 bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs truncate max-w-[90px]">
                        {img.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttachedImages((prev) => prev.filter((i) => i.id !== img.id));
                        }}
                        className="w-5 h-5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewModalImg(img.dataUrl);
                      }}
                      className="self-center flex items-center gap-1 text-[10px] font-semibold text-white/95 bg-white/20 hover:bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Maximize2 size={10} />
                      <span>Preview</span>
                    </button>
                  </div>

                  {/* Size Badge (Visible when not hovered) */}
                  <span className="absolute bottom-1 right-1 text-[9px] font-medium text-white/80 bg-black/70 px-1.5 py-0.2 rounded group-hover:hidden">
                    {img.size}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button with Success State */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={submitSuccess}
          className={cn(
            "w-full h-9 rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer",
            submitSuccess
              ? "bg-emerald-500 text-white"
              : "bg-white text-black hover:bg-neutral-200 active:scale-[0.99]"
          )}
        >
          {submitSuccess ? (
            <>
              <Check size={14} />
              <span>Trade Logged with {attachedImages.length} Image{attachedImages.length === 1 ? "" : "s"}!</span>
            </>
          ) : (
            <span>Submit Trade Log</span>
          )}
        </button>

        {/* Fullscreen Lightbox Modal for Chart Preview */}
        {previewModalImg && (
          <div
            onClick={() => setPreviewModalImg(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#09090b]"
            >
              <img
                src={previewModalImg}
                alt="Full Chart Preview"
                className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
              />
              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer shadow-md"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

