import { Card } from "@/components/card";

export default function ProjectPhotosCard({ request }) {
  const projectPhotos = request?.photos || request?.images || [];

  return (
    <Card>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1A362D]">Project Photos</h2>

            <p className="mt-1 text-sm text-gray-500">
              Images uploaded by the customer.
            </p>
          </div>

          <span className="rounded-full bg-[#E8F5F1] px-3 py-1 text-xs font-semibold text-[#1A362D]">
            {projectPhotos.length} Photo{projectPhotos.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {projectPhotos.length > 0 ? (
            projectPhotos.map((photo, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-100"
              >
                <img
                  src={photo}
                  alt={`Project ${index + 1}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              </div>
            ))
          ) : (
            <div className="col-span-2 rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
              No project photos were uploaded for this request.
            </div>
          )}
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-[#E8F5F1] p-2">
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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 6h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"
                />
              </svg>
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Need more information?
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                If these photos are not enough, you can contact the customer
                after accepting the request for additional details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
