import { cn } from "@/lib/utils";
import { EconomicEvent } from "@/types";

interface ImpactBadgeProps {
  impact: EconomicEvent["impact"];
  className?: string;
}

export function ImpactBadge({ impact, className }: ImpactBadgeProps) {
  const getImpactStyles = () => {
    switch (impact) {
      case "high":
        return "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
      case "medium":
        return "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
      case "low":
        return "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("w-3 h-3 rounded-sm", getImpactStyles())} />
    </div>
  );
}
