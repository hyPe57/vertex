import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, showSign = true): string {
  const isNegative = value < 0;
  const prefix = isNegative ? "-" : showSign && value > 0 ? "+" : "";
  return `${prefix}$${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, showSign = true): string {
  const prefix = showSign && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatPnL(
  value: number,
  mode: "usd" | "percent" = "usd",
  showSign = true
): string {
  return mode === "usd"
    ? formatCurrency(value, showSign)
    : formatPercent(value, showSign);
}

export function calculateRR(
  entry: number,
  sl: number,
  tp: number,
  direction: "long" | "short"
): number {
  if (direction === "long") {
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
  } else {
    const risk = Math.abs(sl - entry);
    const reward = Math.abs(entry - tp);
    return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0;
  }
}

export function getSessionFromTime(hour: number): string {
  if (hour >= 0 && hour < 8) return "Asian";
  if (hour >= 8 && hour < 13) return "London";
  if (hour >= 13 && hour < 17) return "New York";
  if (hour >= 17 && hour < 22) return "New York";
  return "Asian";
}

export function getDayKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getEmotionLabel(level: number): string {
  const labels: Record<number, string> = {
    1: "Very Negative",
    2: "Negative",
    3: "Neutral",
    4: "Positive",
    5: "Very Positive",
  };
  return labels[level] || "Neutral";
}

export function getEmotionColor(level: number): string {
  const colors: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#eab308",
    4: "#22c55e",
    5: "#10b981",
  };
  return colors[level] || "#eab308";
}
