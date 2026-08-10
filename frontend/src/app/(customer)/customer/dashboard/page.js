"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ProgressBar } from "@/components/progress-bar";
import { StatCard } from "@/components/stat-card";
import { CustomerRequestCard } from "@/components/customer-request-card";
import { getCustomerDashboardData } from "@/services/customer.service";

function formatDate(value) {
  if (!value) return "Not selected";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status) {
  switch (status) {
    case "accepted":
      return "ACCEPTED";
    case "pending":
      return "PENDING";
    case "completed":
      return "COMPLETED";
    case "in_progress":
      return "IN PROGRESS";
    default:
      return status?.toUpperCase() || "PENDING";
  }
}

export default function CustomerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await getCustomerDashboardData();

        if (mounted) {
          setDashboard(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load your dashboard right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = dashboard?.stats;
  const requests = (dashboard?.recentRequests || []).map((request) => ({
    id: request.id,
    title: request.title,
    workerName: request.worker?.fullName || "Assigned worker",
    workerAvatar: request.worker?.profileImage || "/api/placeholder/100/100",
    date: formatDate(request.preferredDate),
    time: request.preferredTime || "Flexible",
    status: formatStatus(request.status),
    rating: request.status === "completed" ? 5 : undefined,
    hasReceipt: request.status === "completed",
  }));

  const activeRequests = stats?.activeRequests ?? 0;
  const totalRequests = stats?.totalRequests ?? 0;
  const completedRequests = stats?.completedRequests ?? 0;
  const pendingRequests = stats?.pendingRequests ?? 0;
  const trustScore = Math.min(
    99,
    90 + completedRequests * 2 + (activeRequests > 0 ? 2 : 0),
  );

  return (
    <div className="space-y-8 ">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A362D]">
            Customer Dashboard
          </h1>

          <p className="mt-1 text-gray-500">
            Manage your service requests and track ongoing work.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="rounded-full bg-gray-100 font-bold"
          >
            Active Requests
            <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-white">
              {activeRequests}
            </span>
          </Button>

          <Link href="/customer/workers">
            <Button variant="primary" className="rounded-full shadow-sm">
              + New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side */}

        <div className="space-y-4 lg:col-span-8">
          {loading ? (
            <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              Loading your requests...
            </Card>
          ) : error ? (
            <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
              {error}
            </Card>
          ) : requests.length === 0 ? (
            <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
              You have no requests yet. Create your first request to get
              started.
            </Card>
          ) : (
            requests.map((request) => (
              <Link
                key={request.id}
                href={`/customer/dashboard/requests/${request.id}`}
              >
                <div className="transition-transform duration-200 hover:scale-[1.01]">
                  <CustomerRequestCard
                    title={request.title}
                    workerName={request.workerName}
                    workerAvatar={request.workerAvatar}
                    date={request.date}
                    time={request.time}
                    status={request.status}
                    rating={request.rating}
                    hasReceipt={request.hasReceipt}
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Right Side */}

        <div className="space-y-6 lg:col-span-4 ">
          {/* Trust Score */}

          <Card className="relative overflow-hidden bg-[#1A362D] text-gray-600">
            <h3 className="mb-4 text-lg font-medium">Trust Score</h3>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-5xl font-extrabold">{trustScore}</span>

              <span className="text-lg text-emerald-200">/ 100</span>
            </div>

            <div className="mb-4">
              <ProgressBar
                progress={trustScore}
                colorClass="bg-[#B8860B]"
                trackClass="bg-white/20"
              />
            </div>

            <p className="text-sm leading-relaxed text-emerald-200">
              You are one of our most trusted customers with an excellent
              service history.
            </p>

            <svg
              className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 text-white/5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Card>

          {/* Stats */}

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="REQUESTS"
              value={totalRequests.toString()}
              icon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9m-5-4h5m0 0v5m0-5L10 14"
                  />
                </svg>
              }
            />

            <StatCard
              title="COMPLETED"
              value={completedRequests.toString()}
              icon={
                <svg
                  className="h-5 w-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
            />

            <StatCard
              title="PENDING"
              value={pendingRequests.toString()}
              icon={
                <svg
                  className="h-5 w-5 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                </svg>
              }
            />

            <StatCard
              title="FAVORITE"
              value="Plumbing"
              icon={
                <svg
                  className="h-5 w-5 text-[#1A362D]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
            />
          </div>

          {/* Recent Activity */}

          <Card>
            <h3 className="mb-4 text-lg font-bold text-[#1A362D]">
              Recent Activity
            </h3>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Activity will appear here as soon as you create requests.
                </p>
              ) : (
                requests.slice(0, 3).map((request, index) => {
                  const borderClass =
                    request.status === "COMPLETED"
                      ? "border-emerald-500"
                      : request.status === "PENDING"
                        ? "border-amber-500"
                        : "border-[#1A362D]";

                  return (
                    <div
                      key={`${request.id}-${index}`}
                      className={`border-l-4 ${borderClass} pl-3`}
                    >
                      <p className="font-medium text-gray-900">
                        {request.title} {request.status.toLowerCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {request.date} • {request.workerName}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
