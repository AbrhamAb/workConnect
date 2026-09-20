import { Card } from "@/components/card";

export function UploadGuidelines() {
  const requirements = [
    "Government-issued ID (National ID, Passport, or Driver's License).",
    "Professional certificate related to your primary trade.",
    "Documents must be clear, readable, and not expired.",
    "Photos should be taken in good lighting without cropping important details.",
  ];

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">
            Before You Upload
          </h2>

          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Please review the following requirements before submitting your
            verification request.
          </p>
        </div>

        <div className="space-y-4">
          {requirements.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F5F1]">
                <svg
                  className="h-4 w-4 text-[#1A362D]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <p className="text-sm leading-relaxed text-gray-700">{item}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 text-[#1A362D]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>

            <div>
              <p className="font-semibold text-gray-900">
                Your privacy matters
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Your documents are securely stored and used only for identity
                verification. They will never be shared with customers or other
                workers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
