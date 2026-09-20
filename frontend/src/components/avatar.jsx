import Image from "next/image";

import { cn } from "@/lib/utils";

export function Avatar({ src, alt = "Avatar", size = "md", className }) {
  const sizes = {
    sm: {
      className: "h-8 w-8",
      pixels: 32,
    },
    md: {
      className: "h-10 w-10",
      pixels: 40,
    },
    lg: {
      className: "h-14 w-14",
      pixels: 56,
    },
    "2xl": {
      className: "h-20 w-20",
      pixels: 80,
    },
  };

  const avatarSize = sizes[size] || sizes.md;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gray-200",
        avatarSize.className,
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${avatarSize.pixels}px`}
          className="object-cover"
        />
      ) : (
        <svg
          className="h-full w-full text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />{" "}
        </svg>
      )}{" "}
    </div>
  );
}
