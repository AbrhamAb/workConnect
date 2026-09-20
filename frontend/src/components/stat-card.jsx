import { Card } from "./card";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  icon,
  trend,
  variant = "default",
  className,
}) {
  const isPrimary = variant === "primary";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border",
        isPrimary
          ? "border-[#1A362D]/30 shadow-md bg-[#F4F9F7]" // Subtle tinted background for primary
          : "border-gray-100 shadow-sm bg-white",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-5">
        <div
          className={cn(
            "p-3 rounded-2xl flex items-center justify-center transition-all duration-300",
            isPrimary
              ? "bg-[#1A362D] text-white shadow-md group-hover:scale-105" // Solid brand color for primary icon
              : "bg-slate-50 text-slate-600 group-hover:bg-slate-100", // Neutral background to let SVG color pop
          )}
        >
          {icon}
        </div>
        {trend && (
          <Badge
            className={cn(
              "font-medium border shadow-sm",
              isPrimary
                ? "bg-white text-[#1A362D] border-[#1A362D]/20 hover:bg-[#1A362D]/5"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
            )}
          >
            {trend}
          </Badge>
        )}
      </div>
      <div>
        <p
          className={cn(
            "text-sm mb-1.5 font-bold tracking-wide transition-colors",
            isPrimary
              ? "text-[#1A362D]/80"
              : "text-slate-500 group-hover:text-slate-600",
          )}
        >
          {title}
        </p>
        <h3
          className={cn(
            "text-3xl font-black tracking-tight",
            isPrimary
              ? "text-[#1A362D]"
              : "text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400", // Subtle vibrant gradient for default text
          )}
        >
          {value}
        </h3>
      </div>
    </Card>
  );
}
