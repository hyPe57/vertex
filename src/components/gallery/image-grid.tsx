"use client";

import React, { useState } from "react";
import { Trade } from "@/types";
import { GlassCard } from "./glass-card";
import { ImageExpand } from "./image-expand";
import { EmptyState } from "@/components/ui";
import { Image as ImageIcon } from "lucide-react";
import { useTradeStore } from "@/stores";

interface ImageGridProps {
  trades: Trade[];
}

export function ImageGrid({ trades }: ImageGridProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const deleteTradeImage = useTradeStore((state) => state.deleteTradeImage);

  const handleDelete = (tradeId: string) => {
    deleteTradeImage(tradeId);
    if (selectedTrade?.id === tradeId) {
      setSelectedTrade(null);
    }
  };

  if (trades.length === 0) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px] border border-dashed border-white/[0.06] rounded-2xl bg-[#0c0d14]/40">
        <EmptyState
          icon={<ImageIcon size={48} className="opacity-20 text-neutral-400" />}
          title="No images found"
          description="There are no setups matching your current filters."
        />
      </div>
    );
  }

  return (
    <>
      {/* 5 Columns Grid: Clean edge-to-edge layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-3.5">
        {trades.map((trade) => (
          <GlassCard
            key={trade.id}
            trade={trade}
            onClick={() => setSelectedTrade(trade)}
            onDelete={() => handleDelete(trade.id)}
          />
        ))}
      </div>

      {selectedTrade && (
        <ImageExpand
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onDelete={() => handleDelete(selectedTrade.id)}
        />
      )}
    </>
  );
}
