"use client";

import { Card } from "@/components/card";
import { Avatar } from "@/components/avatar";

export default function RequestReviewCard({ review }) {
  if (!review) {
    return null;
  }

  return (
    <Card>
      <div className="space-y-5">
        {/* Header */}

        <div>
          <h2 className="text-xl font-bold text-[#1A362D]">Customer Review</h2>

          <p className="mt-1 text-sm text-gray-500">
            Feedback left after this request was completed.
          </p>
        </div>

        {/* Customer */}

        <div className="flex items-center gap-4">
          <Avatar
            src={review.customerProfileImage}
            alt={review.customerName}
            size="md"
          />

          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">
              {review.customerName}
            </h3>

            <p className="text-sm text-gray-500">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Recently"}
            </p>
          </div>
        </div>

        {/* Rating */}

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= review.rating
                    ? "text-lg text-yellow-500"
                    : "text-lg text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>

          <span className="font-semibold text-gray-900">{review.rating}/5</span>
        </div>

        {/* Comment */}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm leading-7 text-gray-700">
            {review.comment ||
              "The customer left a rating without a written review."}
          </p>
        </div>
      </div>
    </Card>
  );
}
