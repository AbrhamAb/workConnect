"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, Search, ShieldCheck, Users } from "lucide-react";

import { getWorkers } from "@/services/worker.service";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getWorkers()
      .then((data) => {
        if (mounted) setWorkers(data);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError.message || "Unable to load workers.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workers;
    return workers.filter((worker) => [worker.fullName, worker.primarySkill, worker.city].some((value) => value?.toLowerCase().includes(query)));
  }, [search, workers]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Directory</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Workers</h1><p className="mt-1 text-sm text-slate-500">Monitor verified professionals active on the marketplace.</p></div>
        <Link href="/admin/workers/pending" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100">Verification queue <ArrowRight className="h-4 w-4" /></Link>
      </section>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><Search className="h-5 w-5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, skill, or city..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none" /><span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-400 sm:block">{filteredWorkers.length} listed</span></div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {loading ? <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading worker directory...</div> : filteredWorkers.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No workers match this search.</div> : <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredWorkers.map((worker) => <article key={worker.workerId} className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div><div className="flex items-start justify-between gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-bold text-emerald-800">{(worker.fullName || "W").slice(0, 1).toUpperCase()}</div><span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Verified</span></div><h2 className="mt-5 text-lg font-bold text-slate-900">{worker.fullName}</h2><p className="mt-1 text-sm text-slate-500">{worker.headline || "Skilled professional"}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{worker.primarySkill}</span><span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"><MapPin className="h-3.5 w-3.5" />{worker.city}</span></div></div><div className="mt-6 border-t border-slate-100 pt-5"><div className="mb-4 flex items-center justify-between text-sm"><span className="text-slate-500">Rating</span><span className="font-bold text-slate-900">{Number(worker.rating || 0).toFixed(1)} / 5</span></div><Link href={`/customer/workers/${worker.workerId}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#133729] py-3 text-sm font-semibold text-white transition hover:bg-[#0c241b]">View profile <ArrowRight className="h-4 w-4" /></Link></div></article>)}</section>}

      <div className="flex items-center gap-4 rounded-3xl bg-[#103322] p-6 text-white shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800/60 text-emerald-300"><Users className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Directory health</p><p className="mt-1 text-sm text-emerald-100/80">Verified workers remain discoverable to customers and ready to receive service requests.</p></div></div>
    </div>
  );
}
