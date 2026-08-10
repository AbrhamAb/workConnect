"use client";

import RouteGuard from "@/components/auth/RouteGuard";
import { TopNav } from "@/components/top-nav";
import { UserMenu } from "@/components/user-menu";

export default function CustomerLayout({ children }) {
  const customerLinks = [
    {
      name: "Workers",
      href: "/customer/workers",
    },
    {
      name: "Dashboard",
      href: "/customer/dashboard",
    },
    {
      name: "Profile",
      href: "/customer/profile",
    },
  ];

  return (
    <RouteGuard allowedRoles={["customer"]}>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <TopNav
          links={customerLinks}
          searchPlaceholder="Search workers..."
          rightActions={
            <>
              <button
                type="button"
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>

              <UserMenu />
            </>
          }
        />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}
