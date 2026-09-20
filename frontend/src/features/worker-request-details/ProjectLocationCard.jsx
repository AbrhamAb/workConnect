import { Card } from "@/components/card";

export default function ProjectLocationCard({ request }) {
  return (
    <Card>
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-[#1A362D]">Project Location</h2>

        {/* Location Preview */}
        <div className="relative h-56 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="absolute inset-0 opacity-40">
            <div className="h-full w-full bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>

          <div className="absolute left-8 top-0 h-full w-2 rotate-12 bg-white/70" />
          <div className="absolute right-16 top-0 h-full w-2 -rotate-6 bg-white/70" />
          <div className="absolute left-0 top-24 h-2 w-full bg-white/70" />
          <div className="absolute left-0 bottom-14 h-2 w-full bg-white/70" />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A362D] shadow-lg">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
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

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-[#E8F5F1] p-2">
              <svg
                className="h-5 w-5 text-[#1A362D]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Customer Address</h3>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {request?.location || "Location not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-sm text-gray-500">Preferred Date</p>

            <p className="mt-1 font-semibold text-[#1A362D]">
              {request?.preferredDate || "Flexible"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <p className="text-sm text-gray-500">Preferred Time</p>

            <p className="mt-1 font-semibold text-[#1A362D]">
              {request?.preferredTime || "Flexible"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
