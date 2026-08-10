import Link from "next/link";

import { Badge } from "@/components/badge";
import { WorkerRequestCard } from "@/components/worker-request-card";

export default function NewRequestsSection({ requests }) {
  const pendingRequests = (requests || []).filter(
    (request) => request.status === "pending",
  );

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            New Service Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review and respond to new customer requests.
          </p>
        </div>

        <Badge variant="alert">{pendingRequests.length} Waiting</Badge>
      </div>

      <div className="space-y-4">
        {pendingRequests.length > 0 ? (
          pendingRequests
            .slice(0, 3)
            .map((request) => (
              <WorkerRequestCard
                key={request.id}
                id={request.id}
                name={request.customer}
                location={request.location}
                avatar={request.avatar}
                price={request.budget}
                priceType="ESTIMATED"
                description={request.title}
              />
            ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            You are all caught up! No new service requests at the moment.
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/worker/requests"
          className="font-semibold text-[#1A362D] hover:underline"
        >
          View all requests →
        </Link>
      </div>
    </section>
  );
}
