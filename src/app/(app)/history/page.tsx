"use client";

import React, { useState, useMemo } from "react";
import { TradeTable } from "@/components/history/trade-table";
import { EditDrawer } from "@/components/history/edit-drawer";
import { mockTrades } from "@/lib/mock-data";
import { Trade } from "@/types";
import { Input, Select, Button } from "@/components/ui";
import { Search, Filter } from "lucide-react";

export default function HistoryPage() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [currencyDisplay, setCurrencyDisplay] = useState<"usd" | "percent">("usd");

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const matchesSearch = trade.asset.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (trade.tags && trade.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesAsset = assetFilter === "all" || trade.asset === assetFilter;
      const matchesDirection = directionFilter === "all" || trade.direction === directionFilter;
      return matchesSearch && matchesAsset && matchesDirection;
    });
  }, [trades, searchQuery, assetFilter, directionFilter]);

  const uniqueAssets = useMemo(() => {
    return Array.from(new Set(trades.map(t => t.asset))).map(asset => ({
      value: asset, label: asset
    }));
  }, [trades]);

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
  };

  const handleSave = (updatedTrade: Trade) => {
    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Trade History</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            {filteredTrades.length} trades recorded
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.04] p-1 rounded-xl shadow-xs">
          <button
            onClick={() => setCurrencyDisplay("usd")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currencyDisplay === "usd" ? "bg-white/[0.08] text-white shadow-xs" : "text-zinc-400 hover:text-white"
            }`}
          >
            $
          </button>
          <button
            onClick={() => setCurrencyDisplay("percent")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              currencyDisplay === "percent" ? "bg-white/[0.08] text-white shadow-xs" : "text-zinc-400 hover:text-white"
            }`}
          >
            %
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0c0d14]/75 border border-white/[0.04] p-3 rounded-2xl shadow-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <Input 
            placeholder="Search assets or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full"
          />
        </div>
        
        <Select
          className="h-10 min-w-[120px]"
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
          options={[
            { value: "all", label: "All Assets" },
            ...uniqueAssets
          ]}
        />

        <Select
          className="h-10 min-w-[120px]"
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          options={[
            { value: "all", label: "All Directions" },
            { value: "long", label: "Long" },
            { value: "short", label: "Short" },
          ]}
        />
        
        <Button variant="secondary" className="h-10 px-4">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0">
        <TradeTable 
          data={filteredTrades} 
          onEdit={handleEdit} 
          currencyDisplay={currencyDisplay}
        />
      </div>

      <EditDrawer
        isOpen={!!editingTrade}
        onClose={() => setEditingTrade(null)}
        trade={editingTrade}
        onSave={handleSave}
      />
    </div>
  );
}
