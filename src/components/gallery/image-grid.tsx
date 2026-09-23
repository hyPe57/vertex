"use client";

import React, { useState } from "react";
import { Trade } from "@/types";
import { GlassCard } from "./glass-card";
import { ImageExpand } from "./image-expand";
import { EmptyState } from "@/components/ui";
import { Image as ImageIcon } from "lucide-react";

interface ImageGridProps {
  trades: Trade[];
}

export function ImageGrid({ trades }: ImageGridProps) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  if (trades.length === 0) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px] border border-dashed border-[var(--border-primary)] rounded-2xl bg-[var(--bg-secondary)]/50">
        <EmptyState
          icon={<ImageIcon size={48} className="opacity-20" />}
          title="No images found"
          description="There are no setups matching your current filters."
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {trades.map((trade) => (
          <GlassCard 
            key={trade.id} 
            trade={trade} 
            onClick={() => setSelectedTrade(trade)} 
          />
        ))}
      </div>

      {selectedTrade && (
        <ImageExpand 
          trade={selectedTrade} 
          onClose={() => setSelectedTrade(null)} 
        />
      )}
    </>
  );
}
