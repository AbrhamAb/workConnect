"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
  Users,
} from "lucide-react";

import { getAdminDashboard, getAdminRequests } from "@/services/admin.service";
import { getWorkers } from "@/services/worker.service";

const statusColors = {
  pending: "bg-amber-400",
  accepted: "bg-emerald-500",
  in_progress: "bg-sky-500",
  completed: "bg-[#133729]",
  confirmed: "bg-[#133729]",
  rejected: "bg-rose-500",
  cancelled: "bg-slate-400",
};

function formatStatus(status) {
  return status.replaceAll("_", " ");
}

export default function VerificationRequestsPage() {
  const [summary, setSummary] = useState({});
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    Promise.all([getAdminDashboard(), getAdminRequests(), getWorkers()])
      .then(([dashboard, requestData, workerData]) => {
        if (!mounted) return;
        setSummary(dashboard);
        setRequests(requestData);
        setWorkers(workerData);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Unable to load reports.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const requestStatuses = useMemo(() => {
    const counts = requests.reduce((result, request) => {
      result[request.status] = (result[request.status] || 0) + 1;
      return result;
    }, {});

    return Object.entries(counts).sort(([, first], [, second]) => second - first);
  }, [requests]);

  const categoryCounts = useMemo(() => {
    const counts = workers.reduce((result, worker) => {
      const category = worker.primarySkill || "Uncategorized";
      result[category] = (result[category] || 0) + 1;
      return result;
    }, {});

    return Object.entries(counts).sort(([, first], [, second]) => second - first);
  }, [workers]);

  const completionRate = summary.totalRequests
    ? Math.round((requests.filter((request) => ["completed", "confirmed"].includes(request.status)).length / summary.totalRequests) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Admin analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Reports &amp; Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">A simple operational view of marketplace activity and worker coverage.</p>
        </div>
        <Link href="/admin/jobs" className="inline-flex items-center gap-2 rounded-xl bg-[#133729] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c241b]">
          View all requests <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total users", summary.totalUsers, Users, "bg-emerald-50 text-emerald-700"],
          ["Active workers", summary.totalWorkers, Activity, "bg-sky-50 text-sky-700"],
          ["Total requests", summary.totalRequests, ClipboardList, "bg-amber-50 text-amber-700"],
          ["Completion rate", `${completionRate}%`, CheckCircle2, "bg-violet-50 text-violet-700"],
        ].map(([label, value, Icon, tone]) => (
          <div key={label} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{loading ? "..." : value ?? 0}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Request status</h2><p className="mt-1 text-sm text-slate-500">Current distribution across all service requests.</p></div><BarChart3 className="h-5 w-5 text-slate-400" /></div>
          <div className="mt-6 space-y-4">{loading ? <p className="text-sm text-slate-500">Loading report...</p> : requestStatuses.length ? requestStatuses.map(([status, count]) => <div key={status}><div className="mb-1.5 flex justify-between text-sm"><span className="font-medium capitalize text-slate-700">{formatStatus(status)}</span><span className="font-bold text-slate-900">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${statusColors[status] || "bg-slate-500"}`} style={{ width: `${Math.max((count / Math.max(requests.length, 1)) * 100, 4)}%` }} /></div></div>) : <p className="text-sm text-slate-500">No requests recorded yet.</p>}</div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Worker distribution</h2><p className="mt-1 text-sm text-slate-500">Workers grouped by primary service category.</p></div><Users className="h-5 w-5 text-slate-400" /></div>
          <div className="mt-6 space-y-4">{loading ? <p className="text-sm text-slate-500">Loading report...</p> : categoryCounts.length ? categoryCounts.map(([category, count]) => <div key={category} className="flex items-center gap-3"><span className="h-3 w-3 rounded-full bg-[#133729]" /><span className="flex-1 text-sm font-medium text-slate-700">{category}</span><span className="text-sm font-bold text-slate-900">{count}</span></div>) : <p className="text-sm text-slate-500">No worker data available.</p>}</div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">The latest requests created on the platform.</p></div><Link href="/admin/jobs" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">Open requests</Link></div>
        <div className="mt-5 divide-y divide-slate-100">{requests.slice(0, 5).map((request) => <div key={request.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-slate-900">{request.title}</p><p className="mt-1 text-xs text-slate-500">{request.referenceCode} · {request.customerName} → {request.workerName}</p></div><span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{formatStatus(request.status)}</span></div>)}{!loading && !requests.length && <p className="py-8 text-center text-sm text-slate-500">No recent activity.</p>}</div>
      </section>

      <div className="flex items-start gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="text-sm font-bold">Verification attention</p><p className="mt-1 text-sm text-amber-800">{Number(summary.pendingVerifications || 0)} worker applications are currently waiting for review.</p></div></div>
    </div>
  );
}
