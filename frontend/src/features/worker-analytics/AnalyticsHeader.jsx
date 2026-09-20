export function AnalyticsHeader({ worker, summary }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1A362D]">
          Analytics
        </h1>

        <p className="mt-2 max-w-2xl text-gray-500">
          Track your overall performance, completed work, ratings, and
          achievements in one place.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-100 bg-[#E8F5F1] px-5 py-4">
        <p className="text-sm font-semibold text-[#1A362D]">Current Status</p>

        <p className="mt-1 text-lg font-bold text-[#1A362D]">
          {summary?.verificationStatus || "Worker Status"}
        </p>
      </div>
    </section>
  );
}
