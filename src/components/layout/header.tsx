"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { PortSelector } from "./port-selector";
import { ChatPanel } from "@/components/ai/chat-panel";
import {
  LayoutDashboard,
  CalendarDays,
  History,
  BarChart3,
  Image,
  Newspaper,
  FlaskConical,
  Bot,
  Hexagon,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/gallery", label: "Gallery", icon: Image },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/backtest", label: "Backtest", icon: FlaskConical },
];

export function Header() {
  const pathname = usePathname();
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-6 gap-6">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <Hexagon size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Vertex
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname?.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "text-brand-500 bg-brand-500/8"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100 dark:hover:bg-surface-100"
                  )}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <PortSelector />

            {/* AI Button */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-brand-500 hover:bg-brand-500/8 transition-all duration-200"
            >
              <Bot size={15} />
              <span className="hidden lg:inline">AI</span>
            </button>

            <div className="w-px h-5 bg-[var(--border-primary)]" />

            <ThemeToggle />

            {/* User Avatar */}
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-bold">
              V
            </button>
          </div>
        </div>
      </header>

      {/* Slide-in AI Assistant Drawer */}
      <ChatPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}
