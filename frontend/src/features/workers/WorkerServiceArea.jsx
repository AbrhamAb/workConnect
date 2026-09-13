export default function WorkerServiceArea({ worker }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header */}

      <div className="border-b border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900">Service Area</h2>
      </div>

      {/* Map Placeholder */}

      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-gray-100">
        {/* Fake Map Pattern */}

        <div className="absolute inset-0 opacity-30">
          <svg className="h-full w-full" viewBox="0 0 400 300" fill="none">
            <path d="M0 60H400" stroke="#9CA3AF" strokeWidth="2" />

            <path d="M0 150H400" stroke="#9CA3AF" strokeWidth="2" />

            <path d="M0 240H400" stroke="#9CA3AF" strokeWidth="2" />

            <path d="M80 0V300" stroke="#9CA3AF" strokeWidth="2" />

            <path d="M200 0V300" stroke="#9CA3AF" strokeWidth="2" />

            <path d="M320 0V300" stroke="#9CA3AF" strokeWidth="2" />
          </svg>
        </div>

        {/* Pin */}

        <div className="relative z-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1A362D] text-white shadow-lg">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom */}

      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-gray-500">
            SERVICE AREA
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {worker.serviceArea.toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>

          <span className="text-sm font-semibold text-emerald-700">
            {worker.workType}
          </span>
        </div>
      </div>
    </section>
  );
}
