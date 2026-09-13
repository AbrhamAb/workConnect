import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-lg";

  const variants = {
    primary:
      "bg-[#1A362D] text-white hover:bg-[#12261f] disabled:hover:bg-[#1A362D]",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:hover:bg-gray-100",
    accent:
      "bg-[#B8860B] text-white hover:bg-[#9a7009] disabled:hover:bg-[#B8860B]",
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-100 disabled:hover:bg-transparent",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
