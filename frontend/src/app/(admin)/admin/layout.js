"use client";

import Link from "next/link";

import RouteGuard from "@/components/auth/RouteGuard";
import AdminSidebar from "@/components/admin-sidebar";
import AdminTopbar from "@/components/admin-topbar";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({ children }) {
  const user = useAuthStore((state) => state.user);
  const mobileLinks = [
    ["Dashboard", "/admin/dashboard"],
    ["Workers", "/admin/workers"],
    ["Verification", "/admin/workers/pending"],
    ["Requests", "/admin/jobs"],
  ];

  return (
    <RouteGuard allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
        <AdminSidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden" aria-label="Admin navigation">
            {mobileLinks.map(([label, href]) => (
              <Link key={href} href={href} className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800">
                {label}
              </Link>
            ))}
          </nav>
          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
