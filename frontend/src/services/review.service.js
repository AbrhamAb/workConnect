import { delay } from "@/lib/delay";

import { apiPost } from "./api.service";
import { getCurrentUser } from "./auth.service";

import {
  findMany,
  findOne,
  insertOne,
  updateOne,
  deleteOne,
} from "./storage.service";

/**
 * Builds a review object with customer information.
 */
function buildReview(review) {
  const customer = findOne(
    "users",
    (user) => user.id === review.customerId && user.role === "customer",
  );

  const fullName = customer?.fullName || "Verified Customer";

  const initials = fullName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    ...review,

    customerName: fullName,

    customerInitials: initials,

    customerProfileImage: customer?.profileImage || "",
  };
}

/**
 * Returns every review.
 */
export async function getReviews() {
  await delay();

  return findMany("reviews")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(buildReview);
}

/**
 * Returns one review by its id.
 */
export async function getReviewById(reviewId) {
  await delay();

  const review = findOne("reviews", (review) => review.id === reviewId);

  return review ? buildReview(review) : null;
}

/**
 * Returns the review associated with a request.
 */
export async function getReviewByRequest(requestId) {
  await delay();

  const review = findOne("reviews", (review) => review.requestId === requestId);

  return review ? buildReview(review) : null;
}

/**
 * Returns every review for a worker.
 */
export async function getWorkerReviews(workerId) {
  await delay();

  return findMany("reviews", (review) => review.workerId === workerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(buildReview);
}

/**
 * Returns every review written by a customer.
 */
export async function getCustomerReviews(customerId) {
  await delay();

  return findMany("reviews", (review) => review.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(buildReview);
}

/**
 * Returns a worker's average rating and review count.
 */
export async function getWorkerRatingSummary(workerId) {
  await delay();

  const reviews = findMany("reviews", (review) => review.workerId === workerId);

  if (!reviews.length) {
    return {
      rating: 0,
      totalReviews: 0,
    };
  }

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return {
    rating: Number(average.toFixed(1)),
    totalReviews: reviews.length,
  };
}

/**
 * Compatibility wrapper.
 */
export async function getWorkerRating(workerId) {
  return getWorkerRatingSummary(workerId);
}

/**
 * Returns worker reviews together with rating summary.
 */
export async function getWorkerReviewsWithSummary(workerId) {
  await delay();

  const reviews = findMany(
    "reviews",
    (review) => review.workerId === workerId,
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const enrichedReviews = reviews.map(buildReview);

  if (!reviews.length) {
    return {
      rating: {
        rating: 0,
        totalReviews: 0,
      },
      reviews: [],
    };
  }

  const average =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  return {
    rating: {
      rating: Number(average.toFixed(1)),
      totalReviews: reviews.length,
    },
    reviews: enrichedReviews,
  };
}

/**
 * Returns whether a request has already been reviewed.
 */
export async function hasCustomerReviewed(requestId) {
  await delay();

  return !!findOne("reviews", (review) => review.requestId === requestId);
}

/**
 * Creates a new review.
 */
export async function createReview(data) {
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can leave reviews.");
  }

  const request = findOne(
    "requests",
    (request) => request.id === data.requestId,
  );

  if (!request) {
    throw new Error("Request not found.");
  }

  if (request.customerId !== customer.id) {
    throw new Error("You can only review your own requests.");
  }

  if (request.status !== "confirmed") {
    throw new Error(
      "Reviews can only be submitted after the job has been confirmed.",
    );
  }

  if (findOne("reviews", (review) => review.requestId === data.requestId)) {
    throw new Error("This request has already been reviewed.");
  }

  const rating = Number(data.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const trimmedComment = data.comment?.trim();

  const review = {
    id: crypto.randomUUID(),

    requestId: request.id,

    workerId: request.workerId,
    customerId: customer.id,

    rating,

    comment: trimmedComment || null,

    createdAt: new Date().toISOString(),
  };

  const numericRequestId = Number(String(data.requestId).replace(/^req-/, ""));

  await apiPost(`/customer/requests/${numericRequestId}/review`, {
    rating,
    comment: trimmedComment || "",
  });

  return buildReview(insertOne("reviews", review));
}

/**
 * Updates an existing review.
 */
export async function updateReview(reviewId, updates) {
  await delay();

  const review = findOne("reviews", (review) => review.id === reviewId);

  if (!review) {
    throw new Error("Review not found.");
  }

  const payload = {};

  if (updates.rating !== undefined) {
    const rating = Number(updates.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }

    payload.rating = rating;
  }

  if (updates.comment !== undefined) {
    const trimmedComment = updates.comment?.trim();

    payload.comment = trimmedComment || null;
  }

  const updatedReview = updateOne(
    "reviews",
    (review) => review.id === reviewId,
    payload,
  );

  return buildReview(updatedReview);
}

/**
 * Deletes a review.
 */
export async function deleteReview(reviewId) {
  await delay();

  return deleteOne("reviews", (review) => review.id === reviewId);
}
