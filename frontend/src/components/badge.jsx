import { cn } from "@/lib/utils";

export function Badge({ children, variant = "default", className, ...props }) {
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider";

  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800", // "ACCEPTED"
    pending: "bg-orange-100 text-orange-800", // "PENDING"
    completed: "bg-blue-100 text-blue-800", // "COMPLETED"
    alert: "bg-rose-100 text-rose-800", // "3 Waiting"
    dark: "bg-gray-800 text-white", // Darker accents
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
