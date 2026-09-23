"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ─── Button ───

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        {
          "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm":
            variant === "primary",
          "bg-surface-100 dark:bg-surface-100 text-surface-800 dark:text-surface-800 hover:bg-surface-200 dark:hover:bg-surface-200 border border-[var(--border-primary)]":
            variant === "secondary",
          "text-surface-600 dark:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-100 hover:text-surface-800 dark:hover:text-surface-800":
            variant === "ghost",
          "bg-loss/10 text-loss hover:bg-loss/20": variant === "danger",
        },
        {
          "h-8 px-3 text-xs": size === "sm",
          "h-9 px-4 text-sm": size === "md",
          "h-10 px-6 text-sm": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Input ───

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <input
        className={cn(
          "h-9 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 text-sm",
          "text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
          "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
          "transition-colors duration-200",
          error && "border-loss focus:ring-loss/30",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-loss">{error}</p>}
    </div>
  );
}

// ─── Select ───

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <select
        className={cn(
          "h-9 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-3 text-sm",
          "text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
          "transition-colors duration-200 appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Badge ───

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "profit" | "loss" | "brand";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-surface-100 dark:bg-surface-100 text-[var(--text-secondary)]":
            variant === "default",
          "bg-profit/10 text-profit": variant === "profit",
          "bg-loss/10 text-loss": variant === "loss",
          "bg-brand-500/10 text-brand-500": variant === "brand",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// ─── Card ───

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export function Card({ children, className, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border-primary)] p-4",
        glass
          ? "glass-card"
          : "bg-[var(--bg-secondary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Drawer ───

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "w-[30%] min-w-[380px]",
}: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed right-0 top-0 h-full z-50 bg-[var(--bg-primary)] border-l border-white/[0.04] shadow-2xl",
              width
            )}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
                {title && (
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {title}
                  </h2>
                )}
                <button
                  onClick={onClose}
                  className="ml-auto p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-surface-100 dark:hover:bg-surface-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Tabs ───

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg bg-surface-100 dark:bg-surface-100 p-0.5",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
            activeTab === tab.id
              ? "text-[var(--text-primary)] bg-[var(--bg-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Sync Status Dot ───

interface SyncDotProps {
  status: "connected" | "disconnected" | "syncing" | "error";
}

export function SyncDot({ status }: SyncDotProps) {
  const color = {
    connected: "bg-profit",
    disconnected: "bg-surface-400",
    syncing: "bg-yellow-400",
    error: "bg-loss",
  }[status];

  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "connected" && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping",
            color
          )}
        />
      )}
      <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", color)} />
    </span>
  );
}

// ─── Empty State ───

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-[var(--text-tertiary)] mb-4">{icon}</div>}
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[var(--text-tertiary)] max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── Stat Box ───

interface StatBoxProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatBox({ label, value, subValue, trend }: StatBoxProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
        {label}
      </span>
      <span
        className={cn("text-lg font-semibold font-mono", {
          "text-profit": trend === "up",
          "text-loss": trend === "down",
          "text-[var(--text-primary)]": trend === "neutral" || !trend,
        })}
      >
        {value}
      </span>
      {subValue && (
        <span className="text-[10px] text-[var(--text-tertiary)]">{subValue}</span>
      )}
    </div>
  );
}
