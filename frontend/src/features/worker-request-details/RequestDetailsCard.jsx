import { Card } from "@/components/card";

function formatDate(date) {
  if (!date) {
    return "Not specified";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) {
    return "Flexible";
  }

  const [hours, minutes] = time.split(":");

  const parsed = new Date();
  parsed.setHours(Number(hours));
  parsed.setMinutes(Number(minutes));

  return parsed.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSubmittedDate(date) {
  if (!date) {
    return "Unknown";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RequestDetailsCard({ request }) {
  const budget = request?.budget
    ? `ETB ${Number(request.budget).toLocaleString()}`
    : "Negotiable";

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A362D]">Request Details</h2>

        <p className="mt-2 text-gray-500">
          Review the project information provided by the customer.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Request Title
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            {request?.title || "Service Request"}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Current Status
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            {request?.status || "pending"}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Preferred Date
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            {formatDate(request?.preferredDate)}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Preferred Time
          </p>

          <p className="mt-2 font-semibold text-gray-900">
            {formatTime(request?.preferredTime)}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-6">
        <h3 className="font-semibold text-gray-900">Project Description</h3>

        <p className="mt-4 leading-8 text-gray-600">
          {request?.description || "No description provided."}
        </p>
      </div>

      <div className="grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-gray-500">Submitted</p>

          <p className="mt-1 font-semibold text-gray-900">
            {formatSubmittedDate(request?.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Budget</p>

          <p className="mt-1 font-semibold text-[#1A362D]">{budget}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Request ID</p>

          <p className="mt-1 font-semibold text-gray-900">
            {request?.id || "-"}
          </p>
        </div>
      </div>
    </Card>
  );
}
