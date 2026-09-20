import { Card } from "@/components/card";

export default function RequestTimeline({ timeline = [] }) {
  return (
    <Card>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#1A362D]">Request Timeline</h2>

        <div className="h-px bg-gray-100" />

        <div className="space-y-6">
          {timeline.map((step, index) => (
            <div key={index} className="flex gap-4">
              {/* Indicator */}

              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.completed
                      ? "bg-[#1A362D] text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.completed ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
                  )}
                </div>

                {index !== timeline.length - 1 && (
                  <div className="mt-2 h-12 w-0.5 bg-gray-200" />
                )}
              </div>

              {/* Content */}

              <div className="flex-1 pb-4">
                <h3
                  className={`font-semibold ${
                    step.completed ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {step.completed ? step.date : "Waiting for update"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
