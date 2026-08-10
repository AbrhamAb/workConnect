import Link from "next/link";
import { Button } from "@/components/button";
import { Card } from "@/components/card";

export function SubmissionSuccess() {
  return (
    <Card className="mx-auto max-w-3xl p-10 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5F1]">
        <svg
          className="h-10 w-10 text-[#1A362D]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-bold text-[#1A362D]">
        Verification Submitted
      </h1>

      <p className="mt-3 text-gray-500">
        Thank you for submitting your verification documents. Our team will
        review your application and notify you once the process is complete.
      </p>

      {/* Status */}
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>

            <h3 className="text-lg font-semibold text-gray-900">
              Pending Review
            </h3>
          </div>

          <span className="rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
            Under Review
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-xl bg-gray-50 p-6">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1A362D] text-white">
              ✓
            </div>

            <div className="text-left">
              <p className="font-semibold text-gray-900">Documents Uploaded</p>

              <p className="text-sm text-gray-500">
                Your files have been securely received.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              •
            </div>

            <div className="text-left">
              <p className="font-semibold text-gray-900">
                Administrator Review
              </p>

              <p className="text-sm text-gray-500">
                Estimated review time: 24–48 hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 opacity-50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300">
              ✓
            </div>

            <div className="text-left">
              <p className="font-semibold text-gray-900">Verified Account</p>

              <p className="text-sm text-gray-500">
                Your verified badge will appear once approved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link href="/worker/dashboard">
        <Button className="mt-8 w-full sm:w-auto">Return to Dashboard</Button>
      </Link>
    </Card>
  );
}
