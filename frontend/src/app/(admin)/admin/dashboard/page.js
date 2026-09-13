"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardList, ShieldAlert, UserPlus, Users } from "lucide-react";

import { getAdminDashboard } from "@/services/admin.service";

const metrics = [
  { key: "totalUsers", label: "Total users", icon: Users, tone: "bg-emerald-50 text-emerald-700" },
  { key: "totalWorkers", label: "Total workers", icon: UserPlus, tone: "bg-amber-50 text-amber-700" },
  { key: "totalRequests", label: "Service requests", icon: ClipboardList, tone: "bg-slate-100 text-slate-700" },
  { key: "pendingVerifications", label: "Pending verification", icon: ShieldAlert, tone: "bg-rose-50 text-rose-700" },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAdminDashboard()
      .then((data) => {
        if (mounted) setSummary(data);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Unable to load dashboard data.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Operations overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Real-time platform performance and management metrics.</p>
        </div>
        <Link href="/admin/workers/pending" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#133729] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c241b]">
          Review verification queue <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ key, label, icon: Icon, tone }) => (
          <div key={key} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? "..." : Number(summary[key] || 0).toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Platform activity</h2><p className="mt-1 text-sm text-slate-500">The key areas that need attention today.</p></div><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <div className="mt-6 divide-y divide-slate-100">
            <Link href="/admin/workers/pending" className="flex items-center gap-4 py-4 transition hover:bg-slate-50"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700"><ShieldAlert className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">Verification queue</p><p className="mt-0.5 text-sm text-slate-500">Review worker applications waiting for approval.</p></div><span className="text-sm font-bold text-rose-700">{Number(summary.pendingVerifications || 0)}</span></Link>
            <Link href="/admin/jobs" className="flex items-center gap-4 py-4 transition hover:bg-slate-50"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><ClipboardList className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">Open service requests</p><p className="mt-0.5 text-sm text-slate-500">Monitor requests that still need worker action.</p></div><span className="text-sm font-bold text-amber-700">{Number(summary.openRequests || 0)}</span></Link>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-[#053320] p-6 text-white shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">System health</p><h2 className="mt-2 text-2xl font-bold">Operations stable</h2><p className="mt-2 text-sm leading-6 text-emerald-100/80">The WorkConnect API and customer workflows are online and ready for review.</p><div className="mt-8 space-y-4 text-sm"><div className="flex justify-between border-b border-emerald-900/60 pb-3"><span className="text-emerald-200">API status</span><span className="font-semibold text-emerald-300">Online</span></div><div className="flex justify-between"><span className="text-emerald-200">Open requests</span><span className="font-semibold">{Number(summary.openRequests || 0)}</span></div></div></div>
      </section>
    </div>
  );
}
