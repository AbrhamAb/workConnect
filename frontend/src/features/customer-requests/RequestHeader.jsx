import Link from "next/link";

export default function RequestHeader({ title, status }) {
  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    ACCEPTED: "bg-sky-100 text-sky-700",
    "IN PROGRESS": "bg-violet-100 text-violet-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <section className="space-y-4">
      {/* Back */}

      <Link
        href="/customer/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1A362D]"
      >
        <svg
          className="h-4 w-4"
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
        Back to Dashboard
      </Link>

      {/* Title */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1A362D]">
            {title}
          </h1>

          <p className="mt-1 text-gray-500">
            View your request details and track its progress.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${
            statusStyles[status]
          }`}
        >
          {status}
        </span>
      </div>
    </section>
  );
}
