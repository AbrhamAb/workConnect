"use client";

import { useEffect, useState } from "react";

import { AnalyticsHeader } from "@/features/worker-analytics/AnalyticsHeader";
import { AnalyticsStats } from "@/features/worker-analytics/AnalyticsStats";
import { PerformanceSummaryCard } from "@/features/worker-analytics/PerformanceSummaryCard";
import { AchievementsCard } from "@/features/worker-analytics/AchievementsCard";
import { Card } from "@/components/card";
import { getWorkerAnalyticsData } from "@/services/worker.service";

export default function WorkerAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadAnalytics() {
      try {
        const analyticsData = await getWorkerAnalyticsData();

        if (mounted) {
          setData(analyticsData);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load analytics right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {loading ? (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          Loading analytics...
        </Card>
      ) : error ? (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error}
        </Card>
      ) : (
        <>
          <AnalyticsHeader worker={data?.worker} summary={data?.summary} />

          <AnalyticsStats stats={data?.stats} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <PerformanceSummaryCard
              stats={data?.stats}
              summary={data?.summary}
            />

            <AchievementsCard achievements={data?.achievements || []} />
          </div>
        </>
      )}
    </div>
  );
}
