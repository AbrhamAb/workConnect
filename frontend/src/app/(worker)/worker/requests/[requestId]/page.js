"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import CustomerInfoCard from "@/features/worker-request-details/CustomerInfoCard";
import RequestDetailsCard from "@/features/worker-request-details/RequestDetailsCard";
import ProjectLocationCard from "@/features/worker-request-details/ProjectLocationCard";
import ProjectPhotosCard from "@/features/worker-request-details/ProjectPhotosCard";
import RequestSidebar from "@/features/worker-request-details/RequestSidebar";
import { Card } from "@/components/card";
import { getWorkerRequestDetails } from "@/services/request.service";
import { getReviewByRequest } from "@/services/review.service";

export default function WorkerRequestDetailsPage() {
  const params = useParams();
  const requestId = params?.requestId;

  const [request, setRequest] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [review, setReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequest = useCallback(async () => {
    if (!requestId) return;

    try {
      const data = await getWorkerRequestDetails(requestId);

      if (!data) {
        setRequest(null);
        setCustomer(null);
        setReview(null);
        return;
      }

      const requestReview = await getReviewByRequest(data.request.id);

      setRequest(data.request);
      setCustomer(data.customer);
      setReview(requestReview);
    } catch (err) {
      setError(err.message || "Unable to load this request right now.");
    }
  }, [requestId]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!requestId) return;

      try {
        setLoading(true);
        setError("");

        const data = await getWorkerRequestDetails(requestId);

        if (cancelled) return;

        if (!data) {
          setRequest(null);
          setCustomer(null);
          setReview(null);
          return;
        }

        const requestReview = await getReviewByRequest(data.request.id);

        if (cancelled) return;

        setRequest(data.request);
        setCustomer(data.customer);
        setReview(requestReview);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load this request right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const headerStatus = useMemo(() => {
    switch (request?.status) {
      case "accepted":
        return "Accepted Request";

      case "in_progress":
        return "Work In Progress";

      case "completed":
        return "Awaiting Customer Confirmation";

      case "confirmed":
        return "Completed Request";

      case "declined":
        return "Declined Request";

      case "cancelled":
        return "Cancelled Request";

      default:
        return "Pending Request";
    }
  }, [request]);

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

  if (!request) {
    return (
      <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
        Request not found.
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/worker/requests"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-[#1A362D]"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Requests
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A362D]">
            {request.title}
          </h1>

          <p className="mt-2 text-gray-600">
            Review the request and update its progress.
          </p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
          {headerStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <CustomerInfoCard customer={customer} request={request} />

          <RequestDetailsCard request={request} />

          <ProjectPhotosCard request={request} />
        </div>

        <div className="lg:col-span-4">
          <RequestSidebar
            request={request}
            review={review}
            onRequestUpdated={loadRequest}
          />
        </div>
      </div>
    </div>
  );
}
