import { Card } from "@/components/card";

export default function RequestPhotos({ photos = [] }) {
  return (
    <Card>
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-[#1A362D]">Attachments</h2>

        <div className="h-px bg-gray-100" />

        {photos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <svg
              className="mx-auto h-10 w-10 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
              />
            </svg>

            <p className="mt-3 text-sm text-gray-500">
              No attachments were included with this request.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-100"
              >
                <img
                  src={photo}
                  alt={`Attachment ${index + 1}`}
                  className="h-48 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
