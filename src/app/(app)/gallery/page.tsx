"use client";

import React, { useState, useMemo } from "react";
import { mockTrades, mockTags } from "@/lib/mock-data";
import { ImageGrid } from "@/components/gallery/image-grid";
import { Select, Badge } from "@/components/ui";

export default function GalleryPage() {
  const [filterAsset, setFilterAsset] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [filterOutcome, setFilterOutcome] = useState<string>("all");

  const tradesWithImages = useMemo(() => {
    return mockTrades.filter((trade) => trade.images && trade.images.length > 0);
  }, []);

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
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Setup Gallery</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Visual journal of your trading setups ({filteredTrades.length} images)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            options={[
              { label: "All Assets", value: "all" },
              ...uniqueAssets.map((asset) => ({ label: asset, value: asset })),
            ]}
          />
          <Select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            options={[
              { label: "All Tags", value: "all" },
              ...mockTags.map((tag) => ({ label: tag.name, value: tag.name })),
            ]}
          />
          <Select
            value={filterOutcome}
            onChange={(e) => setFilterOutcome(e.target.value)}
            options={[
              { label: "All Outcomes", value: "all" },
              { label: "Wins", value: "win" },
              { label: "Losses", value: "loss" },
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
