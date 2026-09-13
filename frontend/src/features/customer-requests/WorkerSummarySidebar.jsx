import Link from "next/link";

import { Card } from "@/components/card";
import { Avatar } from "@/components/avatar";

export default function WorkerSummarySidebar({
  worker,
  status,
  requestedDate,
  responseTime,
  estimatedDuration,
}) {
  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    ACCEPTED: "bg-sky-100 text-sky-700",
    "IN PROGRESS": "bg-violet-100 text-violet-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <>
      {/* Worker */}

      <Card>
        <div className="text-center">
          <Avatar
            src={worker.avatar}
            alt={worker.fullName}
            size="lg"
            className="mx-auto"
          />

          <h2 className="mt-4 text-xl font-bold text-[#1A362D]">
            {worker.name}
          </h2>

          <p className="mt-1 text-gray-500">{worker.profession}</p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-amber-500">★</span>

            <span className="font-medium">{worker.rating}</span>

            <span className="text-gray-400">({worker.reviews})</span>
          </div>

          {worker.verified && (
            <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
              Verified Worker
            </span>
          )}

          <Link
            href={`/customer/workers/${worker.id}`}
            className="mt-5 block rounded-xl bg-[#E8F5F1] py-3 font-bold text-[#1A362D] transition hover:opacity-90"
          >
            View Profile
          </Link>
        </div>
      </Card>

      {/* Status */}

      <Card>
        <h3 className="text-lg font-bold text-[#1A362D]">Request Status</h3>

        <span
          className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
            statusStyles[status]
          }`}
        >
          {status}
        </span>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Requested
            </p>

            <p className="font-semibold text-gray-900">{requestedDate}</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Response Time
            </p>

            <p className="font-semibold text-gray-900">{responseTime}</p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Estimated Duration
            </p>

            <p className="font-semibold text-gray-900">{estimatedDuration}</p>
          </div>
        </div>
      </Card>
    </>
  );
}
