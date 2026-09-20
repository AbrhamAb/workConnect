import { Card } from "@/components/card";

export default function AccountStats({ stats }) {
  const items = [
    {
      label: "REQUESTS",
      value: stats.requests,
    },
    {
      label: "COMPLETED",
      value: stats.completed,
    },
    {
      label: "FAVORITES",
      value: stats.favorites,
    },
    {
      label: "MEMBER",
      value: stats.memberSince,
    },
  ];

  return (
    <Card>
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-[#1A362D]">Account Statistics</h2>

        <div className="h-px bg-gray-100" />

        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-gray-50 p-5 text-center"
            >
              <p className="text-3xl font-extrabold text-[#1A362D]">
                {item.value}
              </p>

              <p className="mt-2 text-xs font-semibold tracking-wide text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-[#1A362D] p-5 text-white">
          <p className="text-sm uppercase tracking-wide text-emerald-100">
            Account Status
          </p>

          <p className="mt-2 text-2xl font-bold">Gold Member</p>

          <p className="mt-3 text-sm text-emerald-50">
            Thanks for being an active member of WorkConnect and supporting
            local workers.
          </p>
        </div>
      </div>
    </Card>
  );
}
