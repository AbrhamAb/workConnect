"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  UserCheck,
  Wrench,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/customers", icon: Users },
  { label: "Workers", href: "/admin/workers", icon: UserCheck },
  { label: "Requests", href: "/admin/jobs", icon: ClipboardList },
  { label: "Verification", href: "/admin/workers/pending", icon: ShieldCheck },
  { label: "Reports", href: "/admin/verification-requests", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ user }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-[#032314] px-4 py-6 text-[#86a397] lg:flex">
      <div>
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-950/30">
            <Wrench className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-bold leading-tight text-white">WorkConnect</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Admin Console</p>
          </div>
        </div>

        <nav className="space-y-1.5" aria-label="Admin navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/admin/dashboard" ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active ? "bg-[#0a3d24] text-white" : "hover:bg-[#073820] hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-emerald-400" : "text-[#86a397]"}`} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-[#0a3d24] bg-[#073820]/70 p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-sm font-bold text-emerald-400">
          {(user?.fullName || "A").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user?.fullName || "Administrator"}</p>
          <p className="truncate text-xs text-emerald-400">{user?.email || "Admin account"}</p>
        </div>
      </div>
    </aside>
  );
}
