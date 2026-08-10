import Link from "next/link";

export default function WorkerBookingCard({ worker }) {
  const isAvailable = worker.availability === "available";

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Action */}

      <Link
        href={`/customer/requests/new/${worker.id}`}
        className="block w-full rounded-xl bg-[#E8F5F1] py-3 text-center font-bold text-[#1A362D] transition hover:opacity-90"
      >
        Request Service
      </Link>

      {/* Divider */}

      <div className="my-6 h-px bg-gray-200"></div>

      {/* Worker Info */}

      <div className="space-y-5">
        {/* Availability */}

        <div className="flex items-start gap-3">
          <div
            className={`mt-1 ${
              isAvailable ? "text-green-600" : "text-amber-500"
            }`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="5" />
            </svg>
          </div>

          <div>
            <p className="font-medium text-gray-900">Availability</p>

            <p className="text-sm text-gray-500">
              {isAvailable ? "Available" : "Busy"}
            </p>
          </div>
        </div>

        {/* Response Rate */}

        <div className="flex items-start gap-3">
          <div className="mt-1 text-[#1A362D]">
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
                d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <p className="font-medium text-gray-900">Response Rate</p>

            <p className="text-sm text-gray-500">
              {worker.responseRate ?? 0}% of requests answered
            </p>
          </div>
        </div>

        {/* Experience */}

        <div className="flex items-start gap-3">
          <div className="mt-1 text-[#1A362D]">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <div>
            <p className="font-medium text-gray-900">Experience</p>

            <p className="text-sm text-gray-500">
              {console.log(worker)}
              {worker.yearsExperience}{" "}
              {worker.yearsExperience === 1 ? "year" : "years"}
            </p>
          </div>
        </div>

        {/* Completed Jobs */}

        <div className="flex items-start gap-3">
          <div className="mt-1 text-[#1A362D]">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div>
            <p className="font-medium text-gray-900">Completed Jobs</p>

            <p className="text-sm text-gray-500">
              {worker.completedJobs ?? 0} jobs completed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
