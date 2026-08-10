import { Card } from "@/components/card";

export function CertificateUpload() {
  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">
            Professional Certificate
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Upload a certificate that demonstrates your professional training or
            qualifications.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-800">Examples include:</p>

          <div className="mt-2 flex flex-wrap gap-2">
            {[
              "Plumbing",
              "Electrical",
              "Carpentry",
              "HVAC",
              "Construction",
              "Painting",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-medium text-gray-700"
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
              d="M12 6v12m6-6H6"
            />
          </svg>

          <h3 className="text-lg font-semibold text-gray-900">
            Upload Certificate
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
