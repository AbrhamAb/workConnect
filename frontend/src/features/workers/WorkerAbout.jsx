export default function WorkerAbout({ worker }) {
  const workerName = worker?.name || "Worker";
  const firstName = workerName.split(" ")[0];

  const about =
    Array.isArray(worker?.about) && worker.about.length
      ? worker.about
      : ["This professional is ready to help with your next project."];

  const metrics = [
    {
      value: worker?.yearsExperience || "0+",
      label: "YEARS EXP.",
    },
    {
      value: worker?.completedJobs ?? 0,
      label: "COMPLETED",
    },
    {
      value: worker?.successRate || "0%",
      label: "SUCCESS RATE",
    },
    {
      value: worker?.activeJobs ?? 0,
      label: "ACTIVE JOBS",
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900">About {firstName}</h2>

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <div className="space-y-5 leading-7 text-gray-600">
        {about.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl bg-gray-50 p-4 text-center"
          >
            <div className="text-3xl font-bold text-[#1A362D]">
              {metric.value}
            </div>

            <div className="mt-2 text-xs font-semibold tracking-wide text-gray-500">
              {metric.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
