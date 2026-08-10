"use client";

import { useState } from "react";

import { createReview } from "@/services/review.service";
import { leaveReviewSchema } from "@/validation/customer/reviewSchema";

export default function LeaveReviewCard({
  requestId,
  workerId,
  onReviewSubmitted,
}) {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleCommentChange(event) {
    setFormData((current) => ({
      ...current,
      comment: event.target.value,
    }));
  }

  function handleRatingChange(rating) {
    setFormData((current) => ({
      ...current,
      rating,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setErrors({});

      await leaveReviewSchema.validate(formData, {
        abortEarly: false,
      });

      setSubmitting(true);

      await createReview({
        requestId,
        workerId,
        rating: formData.rating,
        comment: formData.comment,
      });

      await onReviewSubmitted?.();
    } catch (error) {
      if (error.inner) {
        const validationErrors = {};

        error.inner.forEach((err) => {
          if (!validationErrors[err.path]) {
            validationErrors[err.path] = err.message;
          }
        });

        setErrors(validationErrors);
      } else {
        alert(error.message || "Unable to submit review.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-[#D6E8E1] bg-[#F8FCFA] p-5">
      <div>
        <h4 className="text-lg font-bold text-[#1A362D]">
          Rate Your Experience
        </h4>

        <p className="mt-1 text-sm text-gray-500">
          Your review helps other customers choose reliable workers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Rating */}

        <div>
          <label className="mb-3 block text-sm font-semibold text-gray-900">
            Rating
          </label>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                className="text-3xl transition hover:scale-110"
              >
                {star <= formData.rating ? (
                  <span className="text-yellow-400">★</span>
                ) : (
                  <span className="text-gray-300">★</span>
                )}
              </button>
            ))}
          </div>

          {errors.rating && (
            <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Comment */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900">
            Review
            <span className="ml-2 text-gray-400">(Optional)</span>
          </label>

          <textarea
            rows={5}
            value={formData.comment}
            onChange={handleCommentChange}
            placeholder="Share your experience with this worker..."
            className={`w-full resize-none rounded-xl bg-white px-4 py-3 outline-none transition ${
              errors.comment
                ? "border border-red-500 focus:border-red-500"
                : "border border-gray-200 focus:border-[#1A362D]"
            }`}
          />

          {errors.comment ? (
            <p className="mt-2 text-sm text-red-600">{errors.comment}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              Your comment is optional but helps other customers.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-[#1A362D] py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting Review..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
