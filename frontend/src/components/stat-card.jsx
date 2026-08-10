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
        "relative overflow-hidden",
        isPrimary ? "bg-[#1A362D] text-white" : "bg-white",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={cn(
            "p-3 rounded-xl",
            isPrimary
              ? "bg-white/10 text-white"
              : "bg-gray-50 text-gray-600 border border-gray-100",
          )}
        >
          {icon}
        </div>
        {trend && (
          <Badge variant={isPrimary ? "dark" : "default"}>{trend}</Badge>
        )}
      </div>
      <div>
        <p
          className={cn(
            "text-sm mb-1",
            isPrimary ? "text-emerald-300" : "text-gray-500",
          )}
        >
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      </div>

      {/* Decorative background element for primary variant */}
      {isPrimary && (
        <div className="absolute -bottom-4 -right-4 text-white/5 w-32 h-32 transform rotate-12 pointer-events-none">
          {icon}
        </div>
      )}
    </Card>
  );
}
