"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function TopNav({
  links = [],
  rightActions,
  searchPlaceholder = "Search...",
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-[#1A362D]">
            WorkConnect
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex h-full space-x-8">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center h-full border-b-2 px-1 pt-1 text-sm font-medium transition-colors",
                    active
                      ? "border-[#1A362D] text-[#1A362D]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              <input
                type="text"
                placeholder={searchPlaceholder}
                className="w-64 rounded-full border border-transparent bg-gray-100 py-2 pl-9 pr-4 text-sm transition-all focus:border-gray-300 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">{rightActions}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
