import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { Badge } from "@/components/badge";

function getStatusVariant(status) {
  switch (status) {
    case "accepted":
    case "confirmed":
      return "success";

    case "completed":
      return "primary";

    case "declined":
    case "cancelled":
      return "danger";

    case "in_progress":
      return "warning";

    case "pending":
    default:
      return "pending";
  }
}

export default function WorkerRequestListCard({ request }) {
  return (
    <Link href={`/worker/requests/${request.id}`}>
      <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#1A362D] hover:shadow-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="flex gap-4">
            <Avatar
              src={request.avatar || "/api/placeholder/150/150"}
              alt={request.customer || "Customer"}
              size="lg"
            />

            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">
                  {request.customer || "Customer"}
                </p>

                <h2 className="text-xl font-bold text-gray-900">
                  {request.title}
                </h2>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>📍 {request.location || "Location not specified"}</span>

                <span>🗓️ {request.date || "Flexible"}</span>

                <span className="font-semibold text-[#1A362D]">
                  {request.budget || "Negotiable"}
                </span>
              </div>

              <p className="max-w-2xl line-clamp-2 text-gray-600">
                {request.description || "No description provided."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between lg:items-end">
            <Badge variant={getStatusVariant(request.status)}>
              {request.statusLabel || "Pending"}
            </Badge>

            <span className="mt-6 font-semibold text-[#1A362D] transition-colors hover:text-[#295548]">
              View Details →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
