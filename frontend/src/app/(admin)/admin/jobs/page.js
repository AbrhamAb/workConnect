"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";

import { getAdminRequests } from "@/services/admin.service";

export default function JobsPage() {
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminRequests().then(setRequests).catch((requestError) => setError(requestError.message || "Unable to load requests.")).finally(() => setLoading(false));
  }, []);

  const filteredRequests = useMemo(() => requests.filter((request) => {
    const normalized = query.trim().toLowerCase();
    const matchesStatus = status === "all" || request.status === status;
    const matchesQuery = !normalized || [request.referenceCode, request.title, request.customerName, request.workerName, request.categoryName].some((value) => value?.toLowerCase().includes(normalized));
    return matchesStatus && matchesQuery;
  }), [query, requests, status]);

  return <div className="mx-auto max-w-7xl space-y-6"><section><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Operations</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Service Requests</h1><p className="mt-1 text-sm text-slate-500">Monitor every request moving through the marketplace.</p></section><div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reference, title, customer, or worker..." className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" /></div><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"><option value="all">All statuses</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="rejected">Rejected</option></select></div>{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}<div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">{loading ? <p className="p-10 text-center text-sm text-slate-500">Loading requests...</p> : <table className="w-full min-w-212.5 text-left"><thead className="border-b border-slate-100 bg-slate-50/70"><tr>{["Request", "Customer", "Worker", "Category", "Budget", "Status"].map((heading) => <th key={heading} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredRequests.map((request) => <tr key={request.id} className="transition hover:bg-slate-50"><td className="px-6 py-4"><p className="text-sm font-semibold text-slate-900">{request.title}</p><p className="text-xs text-slate-500">{request.referenceCode}</p></td><td className="px-6 py-4 text-sm text-slate-700">{request.customerName}</td><td className="px-6 py-4 text-sm text-slate-700">{request.workerName}</td><td className="px-6 py-4 text-sm text-slate-600">{request.categoryName}</td><td className="px-6 py-4 text-sm font-semibold text-slate-800">ETB {Number(request.budgetEtb || 0).toLocaleString()}</td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{request.status}</span></td></tr>)}{!filteredRequests.length && <tr><td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-500"><ClipboardList className="mx-auto mb-2 h-6 w-6 text-slate-300" />No requests match your filters.</td></tr>}</tbody></table>}</div></div>;
}
