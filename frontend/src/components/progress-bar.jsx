import { cn } from "@/lib/utils";

export function ProgressBar({
  progress = 0,
  colorClass = "bg-[#B8860B]", // Default gold
  trackClass = "bg-gray-200",
  className,
}) {
  // Ensure progress stays between 0 and 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div
      className={cn(
        "w-full h-2 rounded-full overflow-hidden",
        trackClass,
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          colorClass,
        )}
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
}
