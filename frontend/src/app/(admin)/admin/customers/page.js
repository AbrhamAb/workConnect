"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { getAdminUsers } from "@/services/admin.service";

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminUsers().then(setUsers).catch((requestError) => setError(requestError.message || "Unable to load users.")).finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = role === "all" || user.role === role;
      const matchesQuery = !normalized || [user.fullName, user.email, user.phone].some((value) => value?.toLowerCase().includes(normalized));
      return matchesRole && matchesQuery;
    });
  }, [query, role, users]);

  return <div className="mx-auto max-w-7xl space-y-6"><section><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Directory</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">User Management</h1><p className="mt-1 text-sm text-slate-500">Browse every registered customer, worker, and administrator.</p></section><div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-100 px-3"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone..." className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" /></div><select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"><option value="all">All roles</option><option value="customer">Customers</option><option value="worker">Workers</option><option value="admin">Admins</option></select></div>{error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}<div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">{loading ? <p className="p-10 text-center text-sm text-slate-500">Loading users...</p> : <table className="w-full min-w-[700px] text-left"><thead className="border-b border-slate-100 bg-slate-50/70"><tr>{["Profile", "Role", "Phone", "Status", "Joined"].map((heading) => <th key={heading} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filteredUsers.map((user) => <tr key={user.id} className="transition hover:bg-slate-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-800">{(user.fullName || "U").slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-semibold text-slate-900">{user.fullName}</p><p className="text-xs text-slate-500">{user.email}</p></div></div></td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">{user.role}</span></td><td className="px-6 py-4 text-sm text-slate-600">{user.phone || "Not provided"}</td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{user.isActive ? "Active" : "Inactive"}</span></td><td className="px-6 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}{!filteredUsers.length && <tr><td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500"><Users className="mx-auto mb-2 h-6 w-6 text-slate-300" />No users match your filters.</td></tr>}</tbody></table>}</div></div>;
}
