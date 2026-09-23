"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Sparkles, Key, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini">("openai");
  const [input, setInput] = useState("");
  
  const quickPrompts = [
    "Summarize my key mistakes this year",
    "Analyze my emotion vs win rate",
    "What's my best trading session?",
    "Review my last 10 trades"
  ];

  const messages = [
    { role: "ai", content: "Hi! I'm your trading assistant. I can help analyze your journal data, summarize performance, or review past trades. What would you like to explore?" },
    { role: "user", content: "Can you analyze my emotion vs win rate for the last month?" },
    { role: "ai", content: "Looking at your data for the last 30 days, I found an interesting correlation. When you tagged your trades with 'Calm' or 'Focused', your win rate was 68% with a 2.1 RR. However, trades tagged with 'FOMO' or 'Revenge' had a win rate of just 22%.\n\nI recommend setting a strict rule: if you feel FOMO, walk away from the charts for 15 minutes." }
  ];

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
              <div className="flex gap-2 mb-3 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-primary)]">
                <button 
                  onClick={() => setProvider("openai")}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
                    provider === "openai" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm font-semibold" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  OpenAI
                </button>
                <button 
                  onClick={() => setProvider("gemini")}
                  className={cn(
                    "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
                    provider === "gemini" ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm font-semibold" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  Gemini
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Key className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                </div>
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API Key...`}
                  className="w-full pl-9 pr-10 py-2 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "user" ? "bg-brand-600 text-white" : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)]"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl max-w-[80%] text-sm whitespace-pre-wrap",
                    msg.role === "user" 
                      ? "bg-brand-600 text-white rounded-tr-sm" 
                      : "bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-primary)] shrink-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickPrompts.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-brand-500/40 transition-colors whitespace-nowrap"
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
                  placeholder="Ask anything about your trading..."
                  className="w-full pl-4 pr-12 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 placeholder:text-[var(--text-tertiary)]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      setInput("");
                    }
                  }}
                />
                <button 
                  className={cn(
                    "absolute right-2 p-2 rounded-lg transition-colors",
                    input.trim() ? "bg-brand-600 text-white" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
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
