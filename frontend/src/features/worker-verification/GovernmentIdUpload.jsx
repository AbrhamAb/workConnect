import { Card } from "@/components/card";

export function GovernmentIdUpload() {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">
            Government Issued ID
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload a clear photo or scan of a valid government-issued ID.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-800">
            Accepted documents:
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {["National ID", "Passport", "Driver's License"].map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700 border border-emerald-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 transition hover:border-[#1A362D] hover:bg-[#F7FBF9]">
          <svg
            className="mb-4 h-10 w-10 text-[#1A362D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3-3 3m3-3v12"
            />
          </svg>

          <h3 className="text-lg font-semibold text-gray-900">
            Upload Government ID
          </h3>

          <p className="mt-2 text-center text-sm text-gray-500">
            Drag & drop your file here or click to browse
          </p>

          <p className="mt-3 text-xs text-gray-400">
            PNG, JPG or PDF • Max 10 MB
          </p>

          <input type="file" className="hidden" />
        </label>
      </div>
    </Card>
  );
}
