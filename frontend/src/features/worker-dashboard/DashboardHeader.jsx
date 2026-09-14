"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/button";
import { Switch } from "@/components/switch";

export default function DashboardHeader({ worker, stats }) {
  const [isAvailable, setIsAvailable] = useState(worker?.availability ?? true);

  const summary = useMemo(() => {
    const pending = Number(stats?.pendingRequests || 0);

    const active =
      Number(stats?.acceptedRequests || 0) +
      Number(stats?.inProgressRequests || 0);

    return {
      pendingLabel: pending === 1 ? "1 new request" : `${pending} new requests`,
      activeLabel: active === 1 ? "1 active job" : `${active} active jobs`,
    };
  }, [stats]);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8">
      {/* Subtle background glow decoration */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-50/50 blur-3xl"></div>

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Worker Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-800">
            Welcome back,{" "}
            <span className="text-[#1A362D]">
              {worker?.fullName?.split(" ")[0] || "there"}
            </span>{" "}
            👋
          </h1>

          {/* Replaced the paragraph with scannable, visual status pills */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-amber-200/60 bg-amber-50 px-3.5 py-1.5 shadow-sm transition-all hover:bg-amber-100/50">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
              <span className="text-sm font-medium text-amber-800">
                {summary.pendingLabel} waiting
              </span>
            </div>

            <div className="flex items-center gap-2.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-3.5 py-1.5 shadow-sm transition-all hover:bg-emerald-100/50">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              <span className="text-sm font-medium text-emerald-800">
                {summary.activeLabel} in progress
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {!worker?.verified && (
            <Link href="/worker/verification">
              <Button
                variant="accent"
                className="rounded-xl px-6 font-semibold shadow-sm transition-transform hover:scale-105"
              >
                Verify Account
              </Button>
            </Link>
          )}

          {/* Upgraded toggle container with dynamic colors and pulsing indicator */}
          <div
            className={`flex items-center gap-4 rounded-xl border px-5 py-3 transition-all duration-300 ${
              isAvailable
                ? "border-[#1A362D]/20 bg-[#F4F9F7]"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <p
                  className={`font-bold ${isAvailable ? "text-[#1A362D]" : "text-gray-700"}`}
                >
                  {isAvailable ? "Available" : "Unavailable"}
                </p>
                {/* Live pulsing dot when available */}
                {isAvailable && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1A362D] opacity-40"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1A362D]"></span>
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs font-medium text-gray-500">
                {isAvailable
                  ? "Receiving new requests"
                  : "Hidden from customers"}
              </p>
            </div>

            <div className="pl-2 border-l border-gray-200/60 flex items-center justify-center">
              <Switch checked={isAvailable} onChange={setIsAvailable} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
