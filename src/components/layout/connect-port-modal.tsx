"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortStore } from "@/stores";
import type { Platform } from "@/types";
import { cn } from "@/lib/utils";
import { X, Check, Loader2, ShieldCheck, Sparkles } from "lucide-react";

const PLATFORMS: { id: Platform; name: string; tag: string; desc: string }[] = [
  { id: "mt5", name: "MetaTrader 5", tag: "MT5", desc: "Forex, Indices & Metals" },
  { id: "mt4", name: "MetaTrader 4", tag: "MT4", desc: "Classic Prop & Brokerages" },
  { id: "ctrader", name: "cTrader", tag: "cT", desc: "Spotware High-Speed DMA" },
  { id: "tradelocker", name: "TradeLocker", tag: "TL", desc: "TradingView-native execution" },
  { id: "topstepx", name: "TopstepX", tag: "TX", desc: "Futures Prop Evaluation" },
];

export function ConnectPortModal() {
  const { isAddModalOpen, setIsAddModalOpen, addPort } = usePortStore();

  const [platform, setPlatform] = useState<Platform>("mt5");
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [brokerServer, setBrokerServer] = useState("");
  const [initialBalance, setInitialBalance] = useState("10000");
  const [currentBalance, setCurrentBalance] = useState("10000");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isAddModalOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("กรุณากรอกชื่อพอร์ต (Account Name)");
      return;
    }
    setError("");
    setIsConnecting(true);

    // Simulate authentic broker handshake & sync
    await new Promise((res) => setTimeout(res, 1200));

    addPort({
      name: name.trim(),
      platform,
      initialBalance: parseFloat(initialBalance) || 10000,
      currentBalance: parseFloat(currentBalance) || parseFloat(initialBalance) || 10000,
      accountNumber: accountNumber.trim() || undefined,
      brokerServer: brokerServer.trim() || undefined,
    });

    setIsConnecting(false);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setIsAddModalOpen(false);
      setName("");
      setAccountNumber("");
      setBrokerServer("");
      setPassword("");
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={() => !isConnecting && setIsAddModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg bg-[#0c0d14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  เชื่อมต่อพอร์ตการเทรด (Connect Account)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  เชื่อมต่อพอร์ตจาก MT4, MT5, cTrader หรือ Prop Firms
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(false)}
              disabled={isConnecting}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleConnect} className="p-6 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Platform Selection */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 block">
                เลือกแพลตฟอร์ม (Trading Platform)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((p) => {
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[68px]",
                        isSelected
                          ? "bg-white/[0.08] border-white/20 shadow-xs"
                          : "bg-white/[0.02] border-white/[0.04] hover:border-white/10 hover:bg-white/[0.04]"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-xs font-bold text-white">
                          {p.tag}
                        </span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 flex items-center justify-center text-black">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-400 truncate">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                ชื่อพอร์ต (Account Name) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น FTMO 100K Challenge, Exness Live, My Combine"
                required
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Account Details Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  เลขบัญชี / Login ID
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="เช่น 20938471"
                  className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  Broker Server Name
                </label>
                <input
                  type="text"
                  value={brokerServer}
                  onChange={(e) => setBrokerServer(e.target.value)}
                  placeholder="เช่น FTMO-Server2, Exness-Real"
                  className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Balances Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  เงินทุนเริ่มต้น ($ Initial Balance)
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => {
                    setInitialBalance(e.target.value);
                    if (!currentBalance || currentBalance === initialBalance) {
                      setCurrentBalance(e.target.value);
                    }
                  }}
                  placeholder="10000"
                  step="any"
                  className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                  ยอดเงินปัจจุบัน ($ Current Balance)
                </label>
                <input
                  type="number"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="10000"
                  step="any"
                  className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Investor Key / Password */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                Investor Password / Read-Only Key (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
              />
              <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-400" />
                ปลอดภัย 100%: อ่านเฉพาะประวัติการเทรด ไม่สามารถส่งคำสั่งซื้อขายได้
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isConnecting}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                ยกเลิก (Cancel)
              </button>

              <button
                type="submit"
                disabled={isConnecting || isSuccess}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer",
                  isSuccess
                    ? "bg-emerald-500 text-black font-bold"
                    : "bg-white text-black hover:bg-neutral-200"
                )}
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    กำลังเชื่อมต่อ Broker Server...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check size={14} strokeWidth={3} />
                    เชื่อมต่อสำเร็จ!
                  </>
                ) : (
                  "เชื่อมต่อพอร์ต (Connect Account)"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
