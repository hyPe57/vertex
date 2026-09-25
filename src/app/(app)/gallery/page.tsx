"use client";

import React, { useState, useMemo } from "react";
import { useTradeStore } from "@/stores";
import { mockTags } from "@/lib/mock-data";
import { ImageGrid } from "@/components/gallery/image-grid";
import { Select } from "@/components/ui";

export default function GalleryPage() {
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  const trades = useTradeStore((state) => state.trades);
  const tradesWithImages = useMemo(() => {
    return trades.filter((trade) => trade.images && trade.images.length > 0);
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return tradesWithImages.filter((trade) => {
      if (filterAsset !== "all" && trade.asset !== filterAsset) return false;
      if (filterTag !== "all" && !trade.tags.includes(filterTag)) return false;
      if (filterOutcome === "win" && trade.pnl <= 0) return false;
      if (filterOutcome === "loss" && trade.pnl > 0) return false;
      return true;
    });
  }, [tradesWithImages, filterAsset, filterTag, filterOutcome]);

  const uniqueAssets = Array.from(new Set(tradesWithImages.map((t) => t.asset)));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.04]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Setup Gallery
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.05] text-neutral-400 font-normal">
              {filteredTrades.length} Setups
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Visual journal of chart setups and execution screenshots
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            options={[
              { label: "All Symbols", value: "all" },
              ...uniqueAssets.map((asset) => ({ label: asset, value: asset })),
            ]}
          />
          <Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[
              { label: "All Setups", value: "all" },
              ...mockTags.map((tag) => ({ label: tag.name, value: tag.name })),
            ]}
          />
          <Select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            options={[
              { label: "All Outcomes", value: "all" },
              { label: "Wins (+)", value: "win" },
              { label: "Losses (-)", value: "loss" },
            ]}
          />
        </div>
      </div>

      <div className="flex-1">
        <ImageGrid trades={filteredTrades} />
      </div>
    </div>
  );
}
