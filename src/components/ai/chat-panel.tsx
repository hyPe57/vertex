"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Settings2,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTradeStore } from "@/stores";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type AIProvider = "openai" | "gemini" | "deepseek" | "openrouter" | "claude" | "custom";

interface ModelPreset {
  id: string;
  name: string;
  desc?: string;
}

const PROVIDER_CONFIG: Record<
  AIProvider,
  {
    name: string;
    badge: string;
    docUrl: string;
    defaultModel: string;
    presets: ModelPreset[];
    needsBaseUrl?: boolean;
    defaultBaseUrl?: string;
  }
> = {
  openai: {
    name: "OpenAI",
    badge: "Official",
    docUrl: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    presets: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Smart)" },
      { id: "gpt-4o", name: "GPT-4o (Flagship Multimodal)" },
      { id: "o3-mini", name: "o3-mini (High Reasoning)" },
      { id: "o1", name: "o1 (Deepest Problem Solving)" },
    ],
  },
  gemini: {
    name: "Google Gemini",
    badge: "Free Quota",
    docUrl: "https://aistudio.google.com/app/apikey",
    defaultModel: "gemini-2.0-flash",
    presets: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash (Ultra Fast)" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro (2M Context)" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Lightweight)" },
    ],
  },
  deepseek: {
    name: "DeepSeek",
    badge: "High Value",
    docUrl: "https://platform.deepseek.com/api_keys",
    defaultModel: "deepseek-chat",
    presets: [
      { id: "deepseek-chat", name: "DeepSeek V3 (Chat)" },
      { id: "deepseek-reasoner", name: "DeepSeek R1 (Reasoning Master)" },
    ],
  },
  openrouter: {
    name: "OpenRouter",
    badge: "300+ Models",
    docUrl: "https://openrouter.ai/keys",
    defaultModel: "anthropic/claude-3.5-sonnet",
    presets: [
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (via OpenRouter)" },
      { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via OpenRouter)" },
      { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (Fast)" },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free Tier)" },
      { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B" },
    ],
  },
  claude: {
    name: "Anthropic Claude",
    badge: "Analyst",
    docUrl: "https://console.anthropic.com/settings/keys",
    defaultModel: "claude-3-5-sonnet-20241022",
    presets: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (Best Analysis)" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku (Fast & Compact)" },
    ],
  },
  custom: {
    name: "Custom / Local (Ollama)",
    badge: "Any LLM / Self-Hosted",
    docUrl: "https://ollama.com",
    defaultModel: "llama3",
    needsBaseUrl: true,
    defaultBaseUrl: "http://localhost:11434/v1",
    presets: [
      { id: "llama3", name: "Llama 3 (Ollama)" },
      { id: "mistral", name: "Mistral 7B (Ollama)" },
      { id: "qwen2.5", name: "Qwen 2.5 (Ollama)" },
      { id: "custom", name: "Custom Model Name" },
    ],
  },
};

interface StoredConfig {
  provider: AIProvider;
  apiKeys: Record<AIProvider, string>;
  models: Record<AIProvider, string>;
  customBaseUrl: string;
}

const DEFAULT_CONFIG: StoredConfig = {
  provider: "gemini",
  apiKeys: {
    openai: "",
    gemini: "",
    deepseek: "",
    openrouter: "",
    claude: "",
    custom: "",
  },
  models: {
    openai: "gpt-4o-mini",
    gemini: "gemini-2.0-flash",
    deepseek: "deepseek-chat",
    openrouter: "anthropic/claude-3.5-sonnet",
    claude: "claude-3-5-sonnet-20241022",
    custom: "llama3",
  },
  customBaseUrl: "http://localhost:11434/v1",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const trades = useTradeStore((state) => state.trades);

  // Settings
  const [config, setConfig] = useState<StoredConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");
  const [useCustomModelName, setUseCustomModelName] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "สวัสดีครับ! ผมคือ Vertex AI Trading Coach 🤖\n\nระบบนี้เชื่อมต่อกับ Trading Journal จริงของคุณ สามารถตอบคำถาม วิเคราะห์จุดอ่อน อารมณ์ และข้อผิดพลาดในการเทรดได้แบบ Real-time\n\n📌 คุณสามารถใช้ API Key ของค่ายใดก็ได้ (OpenAI, Gemini, DeepSeek, Claude, OpenRouter, หรือ Ollama ในเครื่อง) และเลือก Model ใดก็ได้ตามต้องการครับ!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vertex_ai_config_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.error("Failed to load AI config", e);
    }
  }, []);

  // Save config to localStorage
  const updateConfig = (updater: (prev: StoredConfig) => StoredConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem("vertex_ai_config_v2", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save AI config", e);
      }
      return next;
    });
  };

  const currentProvider = config.provider;
  const currentKey = config.apiKeys[currentProvider] || "";
  const currentModel = config.models[currentProvider] || PROVIDER_CONFIG[currentProvider].defaultModel;

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Aggregate user trading journal statistics for AI Context
  const tradingContext = useMemo(() => {
    if (!trades || trades.length === 0) return null;

    const totalTrades = trades.length;
    const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
    const losses = trades.filter((t) => (t.pnl ?? 0) < 0);
    const winRate = totalTrades > 0 ? ((wins.length / totalTrades) * 100).toFixed(1) : "0";
    const netPnl = trades.reduce((acc, t) => acc + (t.pnl ?? 0), 0).toFixed(2);

    const grossProfit = wins.reduce((acc, t) => acc + (t.pnl ?? 0), 0);
    const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl ?? 0), 0));
    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : "N/A";

    // Tags & Emotions counts
    const tagCount: Record<string, number> = {};
    const emotionLevelCount: Record<number, number> = {};
    const assetCount: Record<string, { total: number; wins: number; pnl: number }> = {};

    trades.forEach((t) => {
      (t.tags || []).forEach((tag) => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
      if (t.emotionLevel) {
        emotionLevelCount[t.emotionLevel] = (emotionLevelCount[t.emotionLevel] || 0) + 1;
      }
      const asset = t.asset || "Unknown";
      if (!assetCount[asset]) assetCount[asset] = { total: 0, wins: 0, pnl: 0 };
      assetCount[asset].total += 1;
      if ((t.pnl ?? 0) > 0) assetCount[asset].wins += 1;
      assetCount[asset].pnl += t.pnl ?? 0;
    });

    const recentTradesSample = trades.slice(0, 10).map((t) => ({
      date: t.openTime,
      asset: t.asset,
      direction: t.direction,
      result: (t.pnl ?? 0) > 0 ? "WIN" : (t.pnl ?? 0) < 0 ? "LOSS" : "BE",
      pnl: t.pnl,
      rr: t.riskReward,
      emotionLevel: `${t.emotionLevel}/5`,
      tags: t.tags,
      notes: t.notes,
    }));

    return {
      totalTrades,
      winRate: `${winRate}%`,
      netPnl: `$${netPnl}`,
      profitFactor,
      tagBreakdown: tagCount,
      emotionLevels: emotionLevelCount,
      assetBreakdown: assetCount,
      recentTrades: recentTradesSample,
    };
  }, [trades]);

  const quickPrompts = [
    "สรุปข้อผิดพลาดหลักของฉันในปีนี้",
    "วิเคราะห์อารมณ์กับการเทรดของฉัน มีผลต่อ Win Rate ไหม?",
    "สินทรัพย์คู่ไหนที่ฉันเทรดได้กำไรดีที่สุด?",
    "วิเคราะห์ 10 ไม้ล่าสุดให้หน่อยว่าควรปรับปรุงอะไร",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    if (!currentKey && currentProvider !== "custom") {
      setErrorMessage(`กรุณาใส่ API Key ของ ${PROVIDER_CONFIG[currentProvider].name} ในเมนูตั้งค่าก่อนส่งข้อความ`);
      setIsSettingsOpen(true);
      return;
    }

    setErrorMessage(null);
    setInput("");

    const newMessages: Message[] = [...messages, { role: "user", content: messageText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const activeModel = useCustomModelName && customModelInput.trim() ? customModelInput.trim() : currentModel;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: currentProvider,
          apiKey: currentKey,
          model: activeModel,
          baseUrl: currentProvider === "custom" ? config.customBaseUrl : undefined,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          tradingContext,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "ขออภัย ไม่ได้รับคำตอบจากโมเดล",
        },
      ]);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ เกิดข้อผิดพลาด: ${error.message}\n\nคำแนะนำ:\n1. ตรวจสอบว่า API Key ถูกต้องและมียอดเงินคงเหลือ\n2. ตรวจสอบว่าชื่อ Model (${currentModel}) ถูกต้อง\n3. หากเป็น Custom Base URL ให้ตรวจสอบว่า Server ทำงานอยู่`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm("ล้างประวัติการสนทนาทั้งหมด?")) {
      setMessages([
        {
          role: "assistant",
          content: "ประวัติการสนทนาถูกล้างแล้ว มีอะไรให้ Vertex AI ช่วยวิเคราะห์เพิ่มเติมไหมครับ?",
        },
      ]);
      setErrorMessage(null);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[500px] bg-[var(--bg-primary)] border-l border-[var(--border-primary)] shadow-2xl z-50 flex flex-col font-sans"
          >
            {/* 1. Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Vertex AI Coach</h2>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 font-mono font-medium border border-brand-500/20">
                      BYOK
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-tertiary)] flex items-center gap-1">
                    <span>{PROVIDER_CONFIG[currentProvider].name}</span>
                    <span>•</span>
                    <span className="font-mono text-brand-400">
                      {useCustomModelName && customModelInput ? customModelInput : currentModel}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="AI & API Settings"
                  className={cn(
                    "p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all",
                    isSettingsOpen && "bg-brand-500/10 text-brand-500 border border-brand-500/20"
                  )}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChat}
                  title="Clear Chat History"
                  className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. Collapsible Settings Drawer */}
            <AnimatePresence>
              {isSettingsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/80 backdrop-blur-md overflow-hidden shrink-0"
                >
                  <div className="p-4 space-y-3.5 text-xs">
                    {/* Provider Tabs */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          AI Provider (เลือกค่าย AI)
                        </label>
                        <a
                          href={PROVIDER_CONFIG[currentProvider].docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                        >
                          รับ API Key <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--bg-primary)] rounded-lg border border-[var(--border-primary)]">
                        {(Object.keys(PROVIDER_CONFIG) as AIProvider[]).map((pKey) => {
                          const p = PROVIDER_CONFIG[pKey];
                          const isActive = currentProvider === pKey;
                          return (
                            <button
                              key={pKey}
                              type="button"
                              onClick={() => {
                                updateConfig((prev) => ({ ...prev, provider: pKey }));
                                setUseCustomModelName(false);
                              }}
                              className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-md text-[11px] font-medium transition-all relative",
                                isActive
                                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-primary)]"
                                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/40"
                              )}
                            >
                              <span>{p.name.split(" ")[0]}</span>
                              <span className="text-[9px] text-[var(--text-tertiary)] opacity-80 mt-0.5">
                                {p.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* API Key Input */}
                    <div>
                      <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                        {PROVIDER_CONFIG[currentProvider].name} API Key
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                          <Key className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        </div>
                        <input
                          type={showKey ? "text" : "password"}
                          value={currentKey}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig((prev) => ({
                              ...prev,
                              apiKeys: { ...prev.apiKeys, [currentProvider]: val },
                            }));
                          }}
                          placeholder={
                            currentProvider === "custom"
                              ? "Optional for local Ollama..."
                              : `Enter ${PROVIDER_CONFIG[currentProvider].name} API Key...`
                          }
                          className="w-full pl-9 pr-10 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKey(!showKey)}
                          className="absolute inset-y-0 right-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                        >
                          {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                        🔒 API Key จะถูกบันทึกไว้ใน Browser ของคุณเท่านั้น (localStorage) ปลอดภัย 100%
                      </p>
                    </div>

                    {/* Model Selector & Custom Model Option */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                          Model Identifier (โมเดล AI)
                        </label>
                        <button
                          type="button"
                          onClick={() => setUseCustomModelName(!useCustomModelName)}
                          className="text-[10px] text-brand-400 hover:underline"
                        >
                          {useCustomModelName ? "← เลือกจาก Presets" : "+ พิมพ์ชื่อ Model อื่นๆ"}
                        </button>
                      </div>

                      {useCustomModelName ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <Cpu className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          </div>
                          <input
                            type="text"
                            value={customModelInput || currentModel}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomModelInput(val);
                              updateConfig((prev) => ({
                                ...prev,
                                models: { ...prev.models, [currentProvider]: val },
                              }));
                            }}
                            placeholder="e.g. gpt-4-turbo, claude-3-5-sonnet, qwen2.5:72b..."
                            className="w-full pl-9 pr-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      ) : (
                        <select
                          value={currentModel}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig((prev) => ({
                              ...prev,
                              models: { ...prev.models, [currentProvider]: val },
                            }));
                          }}
                          className="w-full py-2 px-3 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
                        >
                          {PROVIDER_CONFIG[currentProvider].presets.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                              {preset.name} ({preset.id})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Custom Base URL (For Ollama, Local LLM, Groq) */}
                    {(currentProvider === "custom" || PROVIDER_CONFIG[currentProvider].needsBaseUrl) && (
                      <div>
                        <label className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                          Base URL Endpoint
                        </label>
                        <input
                          type="text"
                          value={config.customBaseUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateConfig((prev) => ({ ...prev, customBaseUrl: val }));
                          }}
                          placeholder="http://localhost:11434/v1"
                          className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
                        />
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                          รองรับ Ollama, vLLM, LM Studio, หรือ OpenAI-Compatible API ใดๆ
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-brand-500 text-white font-medium text-xs hover:bg-brand-600 transition-colors shadow-xs"
                      >
                        บันทึกการตั้งค่า
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. API Key Reminder Banner (if missing) */}
            {!currentKey && currentProvider !== "custom" && !isSettingsOpen && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-400 shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>ยังไม่ได้ใส่ API Key ของ {PROVIDER_CONFIG[currentProvider].name}</span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="font-semibold underline hover:text-amber-300 ml-2"
                >
                  ตั้งค่าทันที
                </button>
              </div>
            )}

            {/* 4. Chat History Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {messages.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={i}
                    className={cn("flex gap-2.5 max-w-[92%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto flex-row")}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-xs",
                        isUser
                          ? "bg-brand-500 text-white"
                          : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-brand-400"
                      )}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={cn(
                        "p-3 rounded-2xl leading-relaxed whitespace-pre-wrap break-words",
                        isUser
                          ? "bg-brand-500 text-white rounded-tr-xs shadow-xs"
                          : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-xs shadow-xs"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-2.5 items-center mr-auto text-xs text-[var(--text-tertiary)] py-2">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-brand-400 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl">
                    <span className="animate-pulse">กำลังประมวลผลข้อมูลการเทรด...</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">เกิดข้อผิดพลาด</p>
                    <p className="text-[11px] opacity-90 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 5. Quick Prompts */}
            <div className="px-4 py-2 bg-[var(--bg-secondary)]/30 border-t border-[var(--border-primary)] shrink-0">
              <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-medium mb-1.5 tracking-wider">
                คำถามด่วน (อิงจาก Trading Journal จริง)
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    disabled={isLoading}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-brand-400 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Input Form */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={`ถาม Vertex AI เกี่ยวกับพอร์ตการเทรดของคุณ (${PROVIDER_CONFIG[currentProvider].name})...`}
                  className="w-full pl-3.5 pr-12 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 placeholder:text-[var(--text-tertiary)] disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-1.5 p-2 rounded-lg transition-all",
                    input.trim() && !isLoading
                      ? "bg-brand-500 text-white shadow-xs hover:bg-brand-600"
                      : "text-[var(--text-tertiary)] opacity-40 cursor-not-allowed"
                  )}
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>
              <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)] mt-2">
                <span>บันทึก Key ในเครื่อง (localStorage) • ปลอดภัย 100%</span>
                <span>กดปุ่มฟันเฟือง ⚙️ เพื่อสลับค่าย/เปลี่ยน Model</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
