"use client";

import { useEffect, useState } from "react";

import DashboardHeader from "@/features/worker-dashboard/DashboardHeader";
import WorkerStatsGrid from "@/features/worker-dashboard/WorkerStatsGrid";
import NewRequestsSection from "@/features/worker-dashboard/NewRequestsSection";
import ActiveJobsCard from "@/features/worker-dashboard/ActiveJobsCard";
import ReliabilityCard from "@/features/worker-dashboard/ReliabilityCard";
import { Card } from "@/components/card";
import { getWorkerDashboardData } from "@/services/worker.service";

export default function WorkerDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const dashboardData = await getWorkerDashboardData();

        if (mounted) {
          setData(dashboardData);
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

  return (
    <div className="space-y-8">
      {loading ? (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          Loading your dashboard...
        </Card>
      ) : error ? (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error}
        </Card>
      ) : (
        <>
          <DashboardHeader worker={data?.worker} stats={data?.stats} />

          <WorkerStatsGrid stats={data?.stats} worker={data?.worker} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <NewRequestsSection requests={data?.recentRequests || []} />
            </div>

            <div className="space-y-6 lg:col-span-5">
              <ActiveJobsCard requests={data?.recentRequests || []} />
              <ReliabilityCard worker={data?.worker} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
