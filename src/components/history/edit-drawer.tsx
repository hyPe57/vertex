"use client";

import React, { useState, useEffect } from "react";
import { Trade } from "@/types";
import { Drawer, Button, Input, Select, Badge } from "@/components/ui";
import { calculateRR, getEmotionColor } from "@/lib/utils";
import { X, Image as ImageIcon } from "lucide-react";

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onSave?: (updatedTrade: Trade) => void;
}

export function EditDrawer({ isOpen, onClose, trade, onSave }: EditDrawerProps) {
  const [formData, setFormData] = useState<Partial<Trade>>({});

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
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Images</label>
          {formData.images && formData.images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {formData.images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-[var(--border-primary)] aspect-video bg-surface-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-[var(--text-tertiary)]" />
                  </div>
                  <button className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-loss">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-[var(--border-primary)] text-[var(--text-tertiary)] text-xs">
              No images attached
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
