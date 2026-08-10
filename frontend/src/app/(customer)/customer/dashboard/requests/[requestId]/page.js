"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Card } from "@/components/card";
import RequestHeader from "@/features/customer-requests/RequestHeader";
import RequestOverview from "@/features/customer-requests/RequestOverview";
import RequestDescription from "@/features/customer-requests/RequestDescription";
import RequestPhotos from "@/features/customer-requests/RequestPhotos";
import RequestTimeline from "@/features/customer-requests/RequestTimeline";
import WorkerSummarySidebar from "@/features/customer-requests/WorkerSummarySidebar";
import RequestActions from "@/features/customer-requests/RequestActions";
import { getCustomerRequestDetails } from "@/services/request.service";
import { getReviewByRequest } from "@/services/review.service"; // NEW

function normalizeStatus(status) {
  switch (status) {
    case "pending":
      return "PENDING";
    case "accepted":
      return "ACCEPTED";
    case "in_progress":
    case "in progress":
    case "in-progress":
      return "IN PROGRESS";
    case "completed":
      return "COMPLETED";
    case "confirmed":
      return "CONFIRMED";
    case "cancelled":
    case "canceled":
      return "CANCELLED";
    case "declined":
      return "DECLINED";
    default:
      return status?.toUpperCase() || "PENDING";
  }
}

function formatDate(value) {
  if (!value) return "Not selected";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RequestDetailsPage() {
  const params = useParams();
  const requestId = params?.requestId;

  const [details, setDetails] = useState(null);
  const [review, setReview] = useState(null); // NEW
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function handleRequestUpdated() {
    try {
      const data = await getCustomerRequestDetails(requestId);

      setDetails(data);

      // NEW
      const existingReview = await getReviewByRequest(requestId);
      setReview(existingReview);
    } catch {
      // Keep current state if refresh fails.
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadRequest() {
      if (!requestId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        // NEW
        const [data, existingReview] = await Promise.all([
          getCustomerRequestDetails(requestId),
          getReviewByRequest(requestId),
        ]);

        if (mounted) {
          setDetails(data);
          setReview(existingReview);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load this request right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRequest();

    return () => {
      mounted = false;
    };
  }, [requestId]);

  const request = useMemo(() => {
    if (!details?.request) {
      return null;
    }

    const status = normalizeStatus(details.request.status);

    return {
      ...details.request,
      title: details.request.title || "Service Request",
      status,
      requestedDate: formatDate(details.request.createdAt),
      preferredDate: formatDate(details.request.preferredDate),
      location: details.request.location || "Not specified",
      budget: details.request.budget
        ? `${details.request.budget} ETB`
        : "Flexible",
      description: details.request.description || "No description provided.",
      photos: details.request.photos || details.request.images || [],
      timeline: [
        {
          title: "Request Submitted",
          date: formatDate(details.request.createdAt),
          completed: true,
        },
        {
          title: "Worker Accepted",
          date:
            status === "ACCEPTED" ||
            status === "IN PROGRESS" ||
            status === "COMPLETED" ||
            status === "CONFIRMED"
              ? formatDate(details.request.updatedAt)
              : "",
          completed:
            status === "ACCEPTED" ||
            status === "IN PROGRESS" ||
            status === "COMPLETED" ||
            status === "CONFIRMED",
        },
        {
          title: "Work In Progress",
          date:
            status === "IN PROGRESS" ||
            status === "COMPLETED" ||
            status === "CONFIRMED"
              ? formatDate(details.request.updatedAt)
              : "",
          completed:
            status === "IN PROGRESS" ||
            status === "COMPLETED" ||
            status === "CONFIRMED",
        },
        {
          title: "Job Completed",
          date:
            status === "COMPLETED" || status === "CONFIRMED"
              ? formatDate(details.request.updatedAt)
              : "",
          completed: status === "COMPLETED" || status === "CONFIRMED",
        },
      ],
    };
  }, [details]);

  const worker = useMemo(() => {
    if (!details?.worker) {
      return null;
    }

    return {
      id: details.worker.id,
      name: details.worker.fullName || details.worker.name,
      profession: details.worker.primarySkill || "Skilled professional",
      rating: details.worker.rating || 4.8,
      reviews: details.worker.totalReviews || 0,
      verified: details.worker.verified || false,
      avatar: details.worker.profileImage || "/api/placeholder/200/200",
      responseTime: "Usually within 2 hours",
      estimatedDuration: "1 Day",
    };
  }, [details]);

  if (loading) {
    return (
      <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
        Loading request details...
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
        {error}
      </Card>
    );
  }

  if (!request || !worker) {
    return (
      <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
        This request could not be found.
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <RequestHeader title={request.title} status={request.status} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <RequestOverview request={request} worker={worker} />

          <RequestDescription description={request.description} />

          <RequestPhotos photos={request.photos} />

          <RequestTimeline timeline={request.timeline} />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <WorkerSummarySidebar
            worker={worker}
            status={request.status}
            requestedDate={request.requestedDate}
            estimatedDuration={worker.estimatedDuration}
            responseTime={worker.responseTime}
          />

          <RequestActions
            requestId={request.id}
            workerId={worker.id}
            status={request.status}
            onRequestUpdated={handleRequestUpdated}
          />
        </div>
      </div>
    </div>
  );
}
