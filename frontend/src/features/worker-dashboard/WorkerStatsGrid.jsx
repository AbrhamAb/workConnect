import { StatCard } from "@/components/stat-card";

export default function WorkerStatsGrid({ stats, worker }) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Completed Jobs"
        value={String(stats?.completedRequests ?? 0)}
        trend={
          stats?.completedRequests
            ? "Tracked from your completed requests"
            : "No completed jobs yet"
        }
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
              d="M9 12l2 2 4-4m6 2A9 9 0 1112 3a9 9 0 019 9z"
            />
          </svg>
        }
      />

      <StatCard
        title="Active Jobs"
        value={String(stats?.acceptedRequests ?? 0)}
        trend="Accepted and ready to start"
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
              d="M9 17v-6h13v6M3 7h18M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2"
            />
          </svg>
        }
      />

      <StatCard
        title="Pending Requests"
        value={String(stats?.pendingRequests ?? 0)}
        variant="primary"
        trend="Waiting for your response"
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
      />

      <StatCard
        title="Average Rating"
        value={
          <>
            {(worker?.rating ?? 0).toFixed(1)}{" "}
            <span className="text-lg font-medium text-gray-400">/ 5</span>
          </>
        }
        trend={`${worker?.totalReviews ?? 0} customer reviews`}
        icon={
          <svg
            className="h-5 w-5 text-[#B8860B]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        }
      />
    </section>
  );
}
