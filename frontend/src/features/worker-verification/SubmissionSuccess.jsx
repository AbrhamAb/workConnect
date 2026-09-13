import Link from "next/link";

import { Button } from "@/components/button";
import { Card } from "@/components/card";

export function SubmissionSuccess() {
  return (
    <Card className="mx-auto max-w-3xl p-6 text-center sm:p-10">
      {/* Success Icon */}
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F5F1]">
        <svg
          className="h-10 w-10 text-[#1A362D]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1 className="mt-6 text-2xl font-bold text-[#1A362D] sm:text-3xl">
        Verification Submitted
      </h1>

      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
        Thank you for submitting your verification documents. Our team will
        review your application and notify you once the process is complete.
      </p>

      {/* Status */}
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Status</p>

            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              Pending Review
            </h3>
          </div>

          <span className="w-fit rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
            Under Review
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-xl bg-gray-50 p-5 text-left sm:p-6">
        <div className="space-y-6">
          {/* Completed */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1A362D] text-sm font-semibold text-white">
              ✓
            </div>

            <div className="pt-0.5">
              <p className="font-semibold text-gray-900">Documents Uploaded</p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Your files have been securely received.
              </p>
            </div>
          </div>

          {/* Current */}
          <div className="flex items-start gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
              •
            </div>

            <div className="pt-0.5">
              <p className="font-semibold text-gray-900">
                Administrator Review
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Estimated review time: 24–48 hours.
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-start gap-4 opacity-50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm">
              ✓
            </div>

            <div className="pt-0.5">
              <p className="font-semibold text-gray-900">Verified Account</p>

              <p className="mt-1 text-sm leading-5 text-gray-500">
                Your verified badge will appear once approved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-8">
        <Link
          href="/worker/dashboard"
          className="inline-block w-full sm:w-auto"
        >
          <Button className="w-full sm:w-auto">Return to Dashboard</Button>
        </Link>
      </div>
    </Card>
  );
}
