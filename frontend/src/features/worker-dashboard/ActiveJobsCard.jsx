import Link from "next/link";

import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";

export default function ActiveJobsCard({ requests }) {
  const activeRequests = (requests || []).filter(
    (request) =>
      request.status === "accepted" || request.status === "in_progress",
  );

  const formatStatus = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "in_progress":
        return "In Progress";
      default:
        return status;
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>

            <p className="mt-1 text-sm text-gray-500">
              Jobs you have accepted or are currently working on.
            </p>
          </div>

          <Link
            href="/worker/requests"
            className="text-sm font-semibold text-[#1A362D] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activeRequests.length > 0 ? (
          activeRequests.slice(0, 2).map((request) => (
            <div key={request.id} className="p-6">
              <Badge className="mb-3">{formatStatus(request.status)}</Badge>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {request.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {request.location}
                  </p>
                </div>

                <span className="whitespace-nowrap font-bold text-[#1A362D]">
                  {request.budget || "Negotiable"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-sm text-gray-500">
            You do not have any active jobs right now.
          </div>
        )}
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-4">
        <Link href="/worker/requests">
          <Button
            variant="secondary"
            fullWidth
            className="bg-white font-semibold"
          >
            View All Requests
          </Button>
        </Link>
      </div>
    </Card>
  );
}
