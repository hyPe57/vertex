import { cn } from "@/lib/utils";

interface CurrencyBadgeProps {
  currency: string;
  className?: string;
}

export function CurrencyBadge({ currency, className }: CurrencyBadgeProps) {
  const getCurrencyStyles = (curr: string) => {
    switch (curr.toUpperCase()) {
      case "USD":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "EUR":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "GBP":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "JPY":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "AUD":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "CAD":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "CHF":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
      case "NZD":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-xs font-semibold rounded-md border",
        getCurrencyStyles(currency),
        className
      )}
    >
      {currency.toUpperCase()}
    </span>
  );
}
