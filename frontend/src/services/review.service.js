import { delay } from "@/lib/delay";

import { apiGet, apiPost } from "./api.service";
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

  const numericRequestId = Number(String(requestId).replace(/^req-/, ""));
  if (!Number.isInteger(numericRequestId) || numericRequestId <= 0) {
    return null;
  }

  const requestResponse = await apiGet(`/customer/requests/${numericRequestId}`);
  const request = requestResponse?.request || requestResponse;
  const numericWorkerId = Number(request?.workerId);
  if (!Number.isInteger(numericWorkerId) || numericWorkerId <= 0) {
    return null;
  }

  const reviewsResponse = await apiGet(`/workers/${numericWorkerId}/reviews`);
  const review = (reviewsResponse?.reviews || []).find(
    (item) => Number(item.requestId) === numericRequestId,
  );

  return review ? buildReview(review) : null;
}

/**
 * Returns every review for a worker.
 */
export async function getWorkerReviews(workerId) {
  await delay();

  const numericWorkerId = Number(String(workerId).replace(/^worker-/, ""));
  if (!Number.isFinite(numericWorkerId) || numericWorkerId < 1) {
    return [];
  }

  const response = await apiGet(`/workers/${numericWorkerId}/reviews`);
  return (response?.reviews || []).map((review) => ({
    ...review,
    customerName: review.customerName || "Verified Customer",
    customerInitials: review.customerInitials || "VC",
    customerProfileImage: review.customerProfileImage || "",
  }));
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

  const numericWorkerId = Number(String(workerId).replace(/^worker-/, ""));
  if (!Number.isFinite(numericWorkerId) || numericWorkerId < 1) {
    return {
      rating: 0,
      totalReviews: 0,
    };
  }

  const response = await apiGet(`/workers/${numericWorkerId}/reviews`);
  const summary = response?.rating || { rating: 0, totalReviews: 0 };

  return {
    rating: Number(summary.rating ?? 0),
    totalReviews: Number(summary.totalReviews ?? 0),
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

  const numericWorkerId = Number(String(workerId).replace(/^worker-/, ""));
  if (!Number.isFinite(numericWorkerId) || numericWorkerId < 1) {
    return {
      rating: {
        rating: 0,
        totalReviews: 0,
      },
      reviews: [],
    };
  }

  const response = await apiGet(`/workers/${numericWorkerId}/reviews`);
  const rating = response?.rating || { rating: 0, totalReviews: 0 };
  const reviews = (response?.reviews || []).map((review) => ({
    ...review,
    customerName: review.customerName || "Verified Customer",
    customerInitials: review.customerInitials || "VC",
    customerProfileImage: review.customerProfileImage || "",
  }));

  return {
    rating: {
      rating: Number(rating.rating ?? 0),
      totalReviews: Number(rating.totalReviews ?? 0),
    },
    reviews,
  };
}

/**
 * Returns whether a request has already been reviewed.
 */
export async function hasCustomerReviewed(requestId) {
  return Boolean(await getReviewByRequest(requestId));
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

  const rating = Number(data.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  const trimmedComment = data.comment?.trim();

  const numericRequestId = Number(String(data.requestId).replace(/^req-/, ""));

  if (!Number.isInteger(numericRequestId) || numericRequestId <= 0) {
    throw new Error("Invalid request id.");
  }

  const response = await apiPost(`/customer/requests/${numericRequestId}/review`, {
    rating,
    comment: trimmedComment || "",
  });

  return response?.review || response;
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
