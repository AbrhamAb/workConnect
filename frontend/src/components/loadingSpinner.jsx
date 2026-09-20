import { cn } from "@/lib/utils";

export function LoadingSpinner({ size = "md", className, text }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
    xl: "h-14 w-14 border-4",
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-gray-200 border-t-[#1A362D]",
          sizeClasses[size] || sizeClasses.md,
        )}
      />
      {text && (
        <p className="text-xs font-medium tracking-wide text-gray-500 animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
