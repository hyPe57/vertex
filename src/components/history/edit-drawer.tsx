"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trade } from "@/types";
import { Drawer, Button, Input, Select, Badge } from "@/components/ui";
import { calculateRR, getEmotionColor } from "@/lib/utils";
import { X, Image as ImageIcon, UploadCloud, Plus } from "lucide-react";

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onSave?: (updatedTrade: Trade) => void;
}

export function EditDrawer({ isOpen, onClose, trade, onSave }: EditDrawerProps) {
  const [formData, setFormData] = useState<Partial<Trade>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [
            ...(prev.images || []),
            {
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              imageUrl: dataUrl,
              thumbnailUrl: dataUrl,
              caption: file.name,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (trade) {
      setFormData(trade);
    }
  }, [trade]);

  const handleChange = (field: keyof Trade, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-recalculate RR if necessary fields change
      if (
        (field === "entryPrice" || field === "stopLoss" || field === "takeProfit") &&
        updated.entryPrice &&
        updated.stopLoss &&
        updated.takeProfit &&
        updated.direction
      ) {
        updated.riskReward = calculateRR(
          Number(updated.entryPrice),
          Number(updated.stopLoss),
          Number(updated.takeProfit),
          updated.direction
        );
      }
      return updated;
    });
  };

  if (!trade) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Edit Trade" width="w-full sm:w-[450px]">
      <div className="flex flex-col gap-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Asset" 
            value={formData.asset || ""} 
            onChange={(e) => handleChange("asset", e.target.value)}
          />
          <Select
            label="Direction"
            value={formData.direction || "long"}
            onChange={(e) => handleChange("direction", e.target.value)}
            options={[
              { value: "long", label: "Long" },
              { value: "short", label: "Short" },
            ]}
          />
          <Input 
            label="Lot Size" 
            type="number"
            step="any"
            value={formData.lotSize ?? ""} 
            onChange={(e) => handleChange("lotSize", parseFloat(e.target.value))}
          />
          <Select
            label="Trading Session"
            value={formData.session || "london"}
            onChange={(e) => handleChange("session", e.target.value)}
            options={[
              { value: "asian", label: "🌏 Asian" },
              { value: "london", label: "🇬🇧 London" },
              { value: "new_york", label: "🇺🇸 New York" },
              { value: "overlap", label: "⚡ Overlap" },
            ]}
          />
        </div>

        {/* Trade Params */}
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Entry Price" 
            type="number"
            step="any"
            value={formData.entryPrice || ""} 
            onChange={(e) => handleChange("entryPrice", parseFloat(e.target.value))}
          />
          <Input 
            label="Exit Price" 
            type="number"
            step="any"
            value={formData.exitPrice || ""} 
            onChange={(e) => handleChange("exitPrice", parseFloat(e.target.value))}
          />
          <Input 
            label="Stop Loss" 
            type="number"
            step="any"
            value={formData.stopLoss || ""} 
            onChange={(e) => handleChange("stopLoss", parseFloat(e.target.value))}
          />
          <Input 
            label="Take Profit" 
            type="number"
            step="any"
            value={formData.takeProfit || ""} 
            onChange={(e) => handleChange("takeProfit", parseFloat(e.target.value))}
          />
        </div>

        <div className="flex justify-between items-center p-3 bg-surface-50 dark:bg-surface-100 rounded-lg">
          <span className="text-sm text-[var(--text-secondary)]">Risk / Reward</span>
          <span className="font-mono font-medium">{formData.riskReward?.toFixed(2) || "0.00"}R</span>
        </div>

        {/* Emotion */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Emotion Level</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => handleChange("emotionLevel", level)}
                className={`flex-1 h-10 rounded-lg transition-all ${
                  formData.emotionLevel === level 
                    ? "ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] scale-105" 
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: getEmotionColor(level),
                  boxShadow: formData.emotionLevel === level ? `0 0 10px ${getEmotionColor(level)}40` : "none"
                }}
              />
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Notes</label>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-y"
            value={formData.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Trade context, execution feeling..."
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map((tag, i) => (
              <Badge key={i} className="pr-1 gap-1">
                {tag}
                <button 
                  onClick={() => handleChange("tags", formData.tags?.filter(t => t !== tag))}
                  className="hover:text-loss"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input 
            placeholder="Add a tag and press Enter..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                const newTag = e.currentTarget.value.trim();
                if (!formData.tags?.includes(newTag)) {
                  handleChange("tags", [...(formData.tags || []), newTag]);
                }
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Images & Chart Screenshots</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>Add Image</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleAddFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {formData.images && formData.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {formData.images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg overflow-hidden border border-white/10 aspect-video bg-black/40 flex items-center justify-center"
                >
                  {img.imageUrl ? (
                    <img
                      src={img.imageUrl}
                      alt={img.caption || "Chart"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-neutral-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images?.filter((i) => i.id !== img.id),
                      }));
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1.5 h-20 rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.015] hover:bg-white/[0.03] text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-xs"
            >
              <UploadCloud size={16} className="opacity-60" />
              <span>Click to attach chart screenshot</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3 pb-8">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            className="flex-1"
            onClick={() => {
              if (onSave) onSave(formData as Trade);
              onClose();
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
