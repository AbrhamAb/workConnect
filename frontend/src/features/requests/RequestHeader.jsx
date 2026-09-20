import Link from "next/link";

export default function RequestHeader({ worker }) {
  const workerId = worker?.id || "";
  const workerName = worker?.name || worker?.fullName || "this professional";
  const firstName =
    workerName === "this professional" ? workerName : workerName.split(" ")[0];

  return (
    <section>
      <Link
        href={`/customer/workers/${workerId}`}
        className="inline-flex items-center gap-2 text-gray-500 transition hover:text-[#1A362D]"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>

        <span>Back to Profile</span>
      </Link>

      <div className="mt-5">
        <h1 className="text-4xl font-bold text-[#1A362D]">
          Request Service from {workerName}
        </h1>

        <p className="mt-3 max-w-2xl leading-7 text-gray-500">
          Provide the details of your project or issue below. {firstName} will
          review your request and get back to you as soon as possible.
        </p>
      </div>
    </section>
  );
}
