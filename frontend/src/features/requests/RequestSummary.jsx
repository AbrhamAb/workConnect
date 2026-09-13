export default function RequestSummary({ worker, request }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      {/* Header */}

      <h2 className="text-lg font-bold text-gray-900">Request Summary</h2>

      <p className="mt-1 text-sm text-gray-500">
        Double-check your request details before sending.
      </p>

      {/* Content */}

      <div className="mt-5 space-y-4">
        {/* Worker */}

        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="font-medium text-gray-600">Worker</span>

          <span className="font-semibold text-[#1A362D]">
            {worker.fullName}
          </span>
        </div>

        {/* Location */}

        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="font-medium text-gray-600">Location</span>

          <span className="text-gray-900">{request.location}</span>
        </div>

        {/* Preferred Date */}

        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="font-medium text-gray-600">Preferred Time</span>

          <span className="text-gray-900">{request.preferredDate}</span>
        </div>

        {/* Budget */}

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-600">Budget</span>

          <span className="text-gray-900">{request.budget}</span>
        </div>
      </div>
    </section>
  );
}
