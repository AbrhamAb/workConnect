"use client";

import { Bell, HelpCircle, Search } from "lucide-react";
import { UserMenu } from "@/components/user-menu";

export default function AdminTopbar({ title = "Admin Console" }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search admin console"
            className="w-full rounded-full border border-transparent bg-slate-100 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
            placeholder={`Search ${title.toLowerCase()}...`}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 text-slate-500">
        <button type="button" aria-label="Notifications" className="relative rounded-full p-2 transition hover:bg-slate-100 hover:text-slate-900">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>
        <button type="button" aria-label="Help and support" className="rounded-full p-2 transition hover:bg-slate-100 hover:text-slate-900">
          <HelpCircle className="h-5 w-5" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}
