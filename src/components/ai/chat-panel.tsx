"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, Key, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradeStore } from "@/stores";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Provider = "openai" | "gemini" | "deepseek" | "claude" | "openrouter";

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const trades = useTradeStore((state) => state.trades);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testError, setTestError] = useState<string | null>(null);

  // Load API key for active provider from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(`vertex_ai_key_${provider}`) || "";
      setApiKey(savedKey);
      setTestStatus("idle");
      setTestError(null);
    } catch {
      // ignore
    }
  }, [provider]);

  const [messages, setMessages] = useState<Array<{ role: "ai" | "user"; content: string }>>([
    {
      role: "ai",
      content:
        "Hi! I'm your trading assistant. I can help analyze your journal data, summarize performance, or review past trades. What would you like to explore?",
    },
    {
      role: "user",
      content: "Can you analyze my emotion vs win rate for the last month?",
    },
    {
      role: "ai",
      content:
        "Looking at your data for the last 30 days, I found an interesting correlation. When you tagged your trades with 'Calm' or 'Focused', your win rate was 68% with a 2.1 RR. However, trades tagged with 'FOMO' or 'Revenge' had a win rate of just 22%.\n\nI recommend setting a strict rule: if you feel FOMO, walk away from the charts for 15 minutes.",
    },
  ]);

  const quickPrompts = [
    "Summarize my key mistakes this year",
    "Analyze my emotion vs win rate",
    "What's my best trading session?",
    "Review my last 10 trades",
  ];

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  const handleTestConnection = async () => {
    if (!apiKey.trim() || testStatus === "testing") return;
    setTestStatus("testing");
    setTestError(null);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey: apiKey.trim(),
          messages: [{ role: "user", content: "Reply 'OK' if you can read this." }],
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Connection failed");
      }
      if (data.resolvedProvider && data.resolvedProvider !== provider) {
        setProvider(data.resolvedProvider);
      }
      setTestStatus("success");
    } catch (err: unknown) {
      setTestStatus("error");
      const msg = (err as Error).message || "Connection failed";
      setTestError(msg);
    }
  };

  const handleKeyChange = (val: string) => {
    const trimmed = val.trim();
    let targetProvider = provider;

    if (trimmed.startsWith("AQ.") || trimmed.startsWith("AIza")) {
      targetProvider = "gemini";
    } else if (trimmed.startsWith("sk-ant-")) {
      targetProvider = "claude";
    } else if (trimmed.startsWith("sk-or-")) {
      targetProvider = "openrouter";
    }

    if (targetProvider !== provider) {
      setProvider(targetProvider);
    }

    setApiKey(val);
    setTestStatus("idle");
    setTestError(null);
    try {
      localStorage.setItem(`vertex_ai_key_${targetProvider}`, val);
    } catch {
      // ignore
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    if (!apiKey.trim()) {
      alert(`Please enter your ${provider.toUpperCase()} API Key first.`);
      return;
    }

    setInput("");
    const newMessages: Array<{ role: "ai" | "user"; content: string }> = [
      ...messages,
      { role: "user", content: textToSend },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Format journal stats
      const total = trades.length;
      const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
      const losses = trades.filter((t) => (t.pnl ?? 0) < 0);
      const winRate = total > 0 ? ((wins.length / total) * 100).toFixed(1) : "0";
      const netPnl = trades.reduce((acc, t) => acc + (t.pnl ?? 0), 0);

      const tradingContext = {
        totalTrades: total,
        winRate: `${winRate}%`,
        netPnl: `$${netPnl.toFixed(2)}`,
        recentTrades: trades.slice(0, 10).map((t) => ({
          asset: t.asset,
          direction: t.direction,
          pnl: t.pnl,
          rr: t.riskReward,
          tags: t.tags,
          notes: t.notes,
        })),
      };

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          messages: newMessages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.content,
          })),
          tradingContext,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to get AI response");
      }

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.reply || "No response received." },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `⚠️ Error: ${error.message || "Failed to connect to AI API"}. Please verify your API Key.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] lg:w-[450px] bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-500/10 text-brand-500 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--text-primary)]">AI Assistant</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">Powered by LLM (BYOK)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-surface-100 dark:hover:bg-surface-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* API Config Area */}
            <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 shrink-0">
              <div className="flex gap-1.5 mb-3 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-primary)] overflow-x-auto scrollbar-none">
                {(
                  [
                    { id: "openai", name: "OpenAI" },
                    { id: "gemini", name: "Gemini" },
                    { id: "deepseek", name: "DeepSeek" },
                    { id: "claude", name: "Claude" },
                    { id: "openrouter", name: "OpenRouter" },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProvider(p.id)}
                    className={cn(
                      "flex-1 text-xs py-1.5 px-2 rounded-md font-medium transition-colors whitespace-nowrap",
                      provider === p.id
                        ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm font-semibold"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Key className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder={`Enter ${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key...`}
                  className="w-full pl-9 pr-10 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Connection Status & Test Button */}
              <div className="flex items-center justify-between mt-2.5 text-[11px]">
                {apiKey.trim() ? (
                  <div className="flex items-center gap-1.5">
                    {testStatus === "testing" ? (
                      <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                        <Loader2 className="w-3 h-3 animate-spin text-brand-500" />
                        <span>กำลังตรวจสอบ Key...</span>
                      </span>
                    ) : testStatus === "success" ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>เชื่อมต่อสำเร็จ พร้อมใช้งาน!</span>
                      </span>
                    ) : testStatus === "error" ? (
                      <span className="flex items-center gap-1 text-red-400 font-medium" title={testError || ""}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[200px]">{testError || "เชื่อมต่อไม่สำเร็จ (ตรวจเช็ค Key)"}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>บันทึกแล้ว (พิมพ์คุยได้ทันที)</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[var(--text-tertiary)]">วาง Key เพื่อเริ่มใช้งาน</span>
                )}

                {apiKey.trim() && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === "testing"}
                    className="text-brand-500 hover:text-brand-400 font-medium hover:underline transition-colors disabled:opacity-50 shrink-0"
                  >
                    {testStatus === "testing" ? "กำลังทดสอบ..." : "ทดสอบการเชื่อมต่อ"}
                  </button>
                )}
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      msg.role === "user"
                        ? "bg-brand-600 text-white"
                        : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)]"
                    )}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap",
                      msg.role === "user"
                        ? "bg-brand-600 text-white rounded-tr-sm"
                        : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 items-center text-xs text-[var(--text-tertiary)]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-brand-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="italic">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] shrink-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    disabled={isLoading}
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-500/40 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask anything about your trading..."
                  className="w-full pl-4 pr-12 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 placeholder:text-[var(--text-tertiary)] disabled:opacity-60"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && input.trim()) {
                      handleSend();
                    }
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2 p-2 rounded-lg transition-colors",
                    input.trim() && !isLoading
                      ? "bg-brand-600 text-white"
                      : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] opacity-50"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
