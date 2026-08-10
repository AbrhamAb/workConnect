"use client";

import { useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import ProjectPhotosCard from "./ProjectPhotosCard";
import RequestReviewCard from "./RequestReviewCard";

import {
  acceptRequest,
  declineRequest,
  startRequest,
  completeRequest,
} from "@/services/request.service";

export default function RequestSidebar({ request, review, onRequestUpdated }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleAction(action) {
    try {
      setSubmitting(true);

      switch (action) {
        case "accept":
          await acceptRequest(request.id);
          break;

        case "decline":
          await declineRequest(request.id);
          break;

        case "start":
          await startRequest(request.id);
          break;

        case "complete":
          await completeRequest(request.id);
          break;

        default:
          return;
      }

      await onRequestUpdated?.();
    } finally {
      setSubmitting(false);
    }
  }

  function renderActions() {
    switch (request.status) {
      case "pending":
        return (
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              disabled={submitting}
              onClick={() => handleAction("accept")}
            >
              {submitting ? "Updating..." : "Accept Request"}
            </Button>

            <Button
              variant="ghost"
              fullWidth
              disabled={submitting}
              className="border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleAction("decline")}
            >
              Decline Request
            </Button>
          </div>
        );

      case "accepted":
        return (
          <Button
            variant="primary"
            fullWidth
            disabled={submitting}
            onClick={() => handleAction("start")}
          >
            {submitting ? "Updating..." : "Start Work"}
          </Button>
        );

      case "in_progress":
        return (
          <Button
            variant="primary"
            fullWidth
            disabled={submitting}
            onClick={() => handleAction("complete")}
          >
            {submitting ? "Updating..." : "Mark as Completed"}
          </Button>
        );

      case "completed":
        return (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Waiting for the customer to confirm that the work has been
            completed.
          </div>
        );

      case "confirmed":
        return (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            This job has been completed successfully.
          </div>
        );

      case "declined":
        return (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            You declined this request.
          </div>
        );

      case "cancelled":
        return (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            This request was cancelled by the customer.
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {review && <RequestReviewCard review={review} />}

      <ProjectPhotosCard request={request} />

      <Card>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A362D]">Request Status</h2>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Manage this request using the available actions below.
            </p>
          </div>

          {request.status === "pending" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Estimated Price (Optional)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-gray-500">
                    ETB
                  </span>

                  <input
                    type="number"
                    placeholder="Enter your estimate"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-14 pr-4 focus:border-[#1A362D] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Message to Customer (Optional)
                </label>

                <textarea
                  rows={5}
                  placeholder="Write an optional message..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 focus:border-[#1A362D] focus:bg-white focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="border-t border-gray-100 pt-6">{renderActions()}</div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <svg
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
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
                <h3 className="font-semibold text-amber-900">
                  Worker Reminder
                </h3>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  Respond promptly and keep customers informed. Reliable workers
                  build stronger reputations over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
