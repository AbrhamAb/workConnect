"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import RequestHeader from "@/features/requests/RequestHeader";
import WorkerSummaryCard from "@/features/requests/WorkerSummaryCard";
import RequestForm from "@/features/requests/RequestForm";
import RequestSummary from "@/features/requests/RequestSummary";
import RequestActions from "@/features/requests/RequestActions";
import { Card } from "@/components/card";
import { getWorkerProfileData } from "@/services/worker.service";
import { createRequest } from "@/services/request.service";
import { requestSchema } from "@/validation/customer/requestSchema";

export default function RequestServicePage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params?.workerId;

  const [worker, setWorker] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    budget: "",
    photos: [],
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWorker() {
      if (!workerId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getWorkerProfileData(workerId);

        if (!mounted) {
          return;
        }

        setWorker({
          ...data.worker,
          rating: data.rating.rating,
          totalReviews: data.rating.totalReviews,
        });
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err.message || "Unable to load this worker right now.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWorker();

    return () => {
      mounted = false;
    };
  }, [workerId]);

  const requestPreview = useMemo(
    () => ({
      location: formData.location || "Not specified",

      preferredDate: formData.date
        ? new Date(formData.date).toLocaleString()
        : "Not selected",

      budget: formData.budget || "Flexible",
    }),
    [formData],
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!worker || !workerId) {
      setError("Please select a worker before sending the request.");
      return;
    }

    try {
      setSubmitting(true);

      setError("");

      setErrors({});

      await requestSchema.validate(formData, {
        abortEarly: false,
      });

      await createRequest({
        workerId,

        title: formData.title,

        description: formData.description,

        location: formData.location,

        date: formData.date,

        preferredDate: formData.date?.split("T")[0] || null,

        preferredTime: formData.date?.split("T")[1] || null,

        budget: formData.budget,

        photos: formData.photos,
      });

      router.push("/customer/dashboard");
    } catch (err) {
      if (err.inner) {
        const validationErrors = {};

        err.inner.forEach((error) => {
          if (!validationErrors[error.path]) {
            validationErrors[error.path] = error.message;
          }
        });

        setErrors(validationErrors);
        return;
      }

      setError(err.message || "Unable to submit your request right now.");
    } finally {
      setSubmitting(false);
    }
  }

  const requestWorker = useMemo(() => {
    if (!worker) {
      return null;
    }

    return {
      id: worker.id,

      name: worker.fullName,

      title: worker.primarySkill || "Skilled professional",

      image: worker.profileImage || "/api/placeholder/150/150",

      rating: worker.rating || 0,

      reviewCount: worker.totalReviews || 0,

      badge: worker.verified ? "Top Rated" : "Verified",
    };
  }, [worker]);

  return (
    <div className="mx-auto max-w-3xl py-8">
      {loading ? (
        <Card className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
          Loading worker details...
        </Card>
      ) : error && !requestWorker ? (
        <Card className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
          {error}
        </Card>
      ) : requestWorker ? (
        <form onSubmit={handleSubmit}>
          <RequestHeader worker={requestWorker} />

          <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <WorkerSummaryCard worker={requestWorker} />

            <div className="mt-8">
              <RequestForm
                worker={requestWorker}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </div>

            <div className="mt-8">
              <RequestSummary worker={requestWorker} request={requestPreview} />
            </div>

            <div className="mt-8">
              <RequestActions worker={requestWorker} submitting={submitting} />
            </div>
          </section>
        </form>
      ) : null}
    </div>
  );
}
