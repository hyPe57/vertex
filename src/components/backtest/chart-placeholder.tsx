"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Maximize2, Settings, BarChart2, Zap } from "lucide-react";

export function ChartPlaceholder() {
  const [activeTimeframe, setActiveTimeframe] = useState("15m");
  const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D"];

  return (
    <div className="relative w-full h-full rounded-xl border border-[var(--border-primary)] bg-[#131722] overflow-hidden flex flex-col font-sans">
      {/* Chart Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2A2E39] bg-[#1E222D]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white font-medium">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">N</div>
            NQ1!
            <span className="text-xs text-gray-400 font-normal ml-2">Nasdaq 100 E-mini</span>
          </div>
          
          <div className="h-4 w-px bg-[#2A2E39] mx-2"></div>
          
          <div className="flex items-center gap-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={cn(
                  "px-2 py-1 text-xs rounded hover:bg-[#2A2E39] transition-colors",
                  activeTimeframe === tf 
                    ? "text-blue-400 font-medium" 
                    : "text-gray-400"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-gray-400">
          <button className="hover:text-white transition-colors p-1"><BarChart2 className="w-4 h-4" /></button>
          <button className="hover:text-white transition-colors p-1"><Settings className="w-4 h-4" /></button>
          <button className="hover:text-white transition-colors p-1"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative w-full h-full">
        {/* Grid lines background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2A2E39 1px, transparent 1px),
              linear-gradient(to bottom, #2A2E39 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Fake candles css art - decorative only */}
        <div className="absolute inset-x-8 inset-y-16 flex items-end justify-between px-10 opacity-30 blur-[1px]">
          {Array.from({ length: 40 }).map((_, i) => {
            const isGreen = Math.random() > 0.4;
            const height = 20 + Math.random() * 60;
            const yOffset = 10 + Math.random() * 40;
            const wickHeight = height + 10 + Math.random() * 20;
            
            return (
              <div key={i} className="relative w-2 flex flex-col items-center" style={{ bottom: `${yOffset}%` }}>
                <div 
                  className={cn("w-px absolute", isGreen ? "bg-[#089981]" : "bg-[#F23645]")} 
                  style={{ height: `${wickHeight}px` }} 
                />
                <div 
                  className={cn("w-full z-10", isGreen ? "bg-[#089981]" : "bg-[#F23645]")} 
                  style={{ height: `${height}px` }} 
                />
              </div>
            );
          })}
        </div>

        {/* Overlay Message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-[#131722]/60 z-20">
          <div className="p-3 bg-blue-500/20 rounded-full mb-4">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">TradingView Advanced Charts</h2>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Connect your broker API to activate real-time market data and interactive charting.
          </p>
          <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Connect Integration
          </button>
        </div>
        
        {/* Y-Axis scale placeholder */}
        <div className="absolute right-0 top-0 bottom-0 w-16 border-l border-[#2A2E39] bg-[#1E222D] flex flex-col justify-between py-8 text-[10px] text-gray-500 items-center">
          <span>15240.0</span>
          <span>15220.0</span>
          <span>15200.0</span>
          <span className="text-blue-400 font-medium">15180.5</span>
          <span>15160.0</span>
          <span>15140.0</span>
          <span>15120.0</span>
        </div>
      </div>
    </div>
  );
}
