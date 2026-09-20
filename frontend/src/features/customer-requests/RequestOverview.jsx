import { Card } from "@/components/card";

export default function RequestOverview({ request, worker }) {
  return (
    <Card>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#1A362D]">Request Overview</h2>

        <span className="text-sm text-gray-500">#{request.id}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Worker */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Worker
          </p>

          <p className="font-semibold text-gray-900">{worker.name}</p>
        </div>

        {/* Requested */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Requested
          </p>

          <p className="font-semibold text-gray-900">{request.requestedDate}</p>
        </div>

        {/* Preferred */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Preferred Date
          </p>

          <p className="font-semibold text-gray-900">{request.preferredDate}</p>
        </div>

        {/* Location */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Location
          </p>

          <p className="font-semibold text-gray-900">{request.location}</p>
        </div>

        {/* Budget */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Budget
          </p>

          <p className="font-semibold text-gray-900">{request.budget}</p>
        </div>

        {/* Status */}

        <div>
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-gray-400">
            Current Status
          </p>

          <p className="font-semibold text-[#1A362D]">{request.status}</p>
        </div>
      </div>
    </Card>
  );
}
