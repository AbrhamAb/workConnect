"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar } from "@/components/avatar";
import { useAuthStore } from "@/store/authStore";

export function UserMenu() {
  const router = useRouter();
  const menuRef = useRef(null);

  const { user, logout } = useAuthStore();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleLogout() {
    setOpen(false);

    await logout();

    router.replace("/login");
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#1A362D]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar
          src={user.profileImage}
          alt={user.fullName || "User"}
          size="md"
          className="border border-gray-200"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <Avatar
              src={user.profileImage}
              alt={user.fullName || "User"}
              size="md"
            />

            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">
                {user.fullName}
              </p>

              <p className="truncate text-sm text-gray-500">{user.email}</p>

              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#1A362D]">
                {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H9m4 8H7a2 2 0 01-2-2V6a2 2 0 012-2h6"
              />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
