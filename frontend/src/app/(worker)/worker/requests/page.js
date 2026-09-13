"use client";

import { useEffect, useMemo, useState } from "react";

import RequestFilters from "@/features/worker-requests/RequestFilters";
import WorkerRequestList from "@/features/worker-requests/WorkerRequestList";
import { Card } from "@/components/card";
import { getWorkerRequestListData } from "@/services/worker.service";

export default function WorkerRequestsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      try {
        setLoading(true);
        setError("");

        const result = await getWorkerRequestListData();

        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load your requests right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadRequests();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const requests = data?.requests || [];

    return requests.filter((request) => {
      const searchableText =
        `${request.customer} ${request.title} ${request.location}`.toLowerCase();

      const matchesQuery = searchableText.includes(query.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [data, query, statusFilter]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
        Loading your requests...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
        {error}
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A362D]">
            My Requests
          </h1>

          <p className="mt-2 text-gray-600">
            Review, manage, and respond to incoming customer service requests.
          </p>
        </div>

        <div className="w-full lg:w-80">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search requests..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 shadow-sm outline-none transition focus:border-[#1A362D]"
            />
          </div>
        </div>
      </div>

      <RequestFilters
        activeFilter={statusFilter}
        onFilterChange={setStatusFilter}
      />

      <WorkerRequestList requests={filteredRequests} />
    </div>
  );
}
