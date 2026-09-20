import { Card } from "@/components/card";

export function PerformanceSummaryCard({ stats, summary }) {
  const items = [
    {
      label: "Total Earnings",
      value: `ETB ${Number(stats?.totalEarnings || 0).toLocaleString()}`,
    },
    {
      label: "Completed Jobs",
      value: `${stats?.completedJobs ?? 0} Jobs`,
    },
    {
      label: "Average Rating",
      value: `${(stats?.averageRating ?? 0).toFixed(1)} / 5.0`,
    },
    {
      label: "Verification Status",
      value: summary?.verificationStatus || "Pending",
      accent: true,
    },
  ];

  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1A362D]">Performance Summary</h2>

      <p className="mt-1 text-sm text-gray-500">
        A quick overview of your performance on WorkConnect.
      </p>

      <div className="mt-6 divide-y divide-gray-100">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <span className="text-gray-600">{item.label}</span>

            <span
              className={`font-semibold ${
                item.accent ? "text-emerald-600" : "text-gray-900"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
