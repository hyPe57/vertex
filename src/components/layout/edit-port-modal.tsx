"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortStore } from "@/stores";
import type { Platform } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { X, Check, Trash2, ArrowUpRight, ArrowDownRight, Settings2 } from "lucide-react";

const PLATFORMS: { id: Platform; name: string }[] = [
  { id: "mt5", name: "MetaTrader 5 (MT5)" },
  { id: "mt4", name: "MetaTrader 4 (MT4)" },
  { id: "ctrader", name: "cTrader" },
  { id: "tradelocker", name: "TradeLocker" },
  { id: "topstepx", name: "TopstepX" },
];

export function EditPortModal() {
  const {
    editingPort,
    setEditingPort,
    isEditModalOpen,
    setIsEditModalOpen,
    updatePort,
    deletePort,
    ports,
  } = usePortStore();

  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<Platform>("mt5");
  const [currentBalance, setCurrentBalance] = useState("0");
  const [initialBalance, setInitialBalance] = useState("0");
  const [accountNumber, setAccountNumber] = useState("");
  const [brokerServer, setBrokerServer] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (editingPort) {
      setName(editingPort.name);
      setPlatform(editingPort.platform);
      setCurrentBalance(editingPort.currentBalance.toString());
      setInitialBalance(editingPort.initialBalance.toString());
      setAccountNumber(editingPort.accountNumber || "");
      setBrokerServer(editingPort.brokerServer || "");
      setConfirmDelete(false);
    }
  }, [editingPort]);

  if (!isEditModalOpen || !editingPort) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updatePort(editingPort.id, {
      name: name.trim(),
      platform,
      currentBalance: parseFloat(currentBalance) || editingPort.currentBalance,
      initialBalance: parseFloat(initialBalance) || editingPort.initialBalance,
      accountNumber: accountNumber.trim() || undefined,
      brokerServer: brokerServer.trim() || undefined,
    });

    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (ports.length <= 1) return;
    deletePort(editingPort.id);
    setIsEditModalOpen(false);
  };

  const handleAdjustBalance = (amount: number) => {
    const cur = parseFloat(currentBalance) || 0;
    setCurrentBalance((cur + amount).toString());
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
          onClick={() => setIsEditModalOpen(false)}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-[#0c0d14] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white">
                <Settings2 size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  แก้ไขพอร์ตการเทรด (Edit Account)
                </h3>
                <p className="text-[11px] text-neutral-400">
                  ปรับยอดเงิน, เปลี่ยนชื่อ หรือตั้งค่าบัญชี
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {/* Account Name */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                ชื่อพอร์ต (Account Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* Platform Selector */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                แพลตฟอร์ม (Platform)
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0c0d14] text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Balance & Quick Deposit/Withdraw */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  ยอดเงินปัจจุบัน ($ Balance)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustBalance(1000)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    +$1K
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustBalance(-500)}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    -$500
                  </button>
                </div>
              </div>
              <input
                type="number"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                step="any"
                required
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors font-mono"
              />
            </div>

            {/* Initial Balance */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                เงินทุนเริ่มต้น ($ Initial Balance)
              </label>
              <input
                type="number"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                step="any"
                required
                className="w-full h-9 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 text-xs text-white focus:outline-none focus:border-white/20 transition-colors font-mono"
              />
            </div>

            {/* Delete Account Area */}
            {ports.length > 1 && (
              <div className="pt-2 border-t border-white/[0.05]">
                {confirmDelete ? (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                    <span className="text-xs text-rose-400 font-medium">
                      ยืนยันการลบพอร์ตนี้หรือไม่?
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 rounded-lg text-xs text-neutral-400 hover:text-white"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
                      >
                        ลบพอร์ต
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                    ลบพอร์ตนี้ออกจากระบบ (Delete Port)
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} strokeWidth={2.5} />
                บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
