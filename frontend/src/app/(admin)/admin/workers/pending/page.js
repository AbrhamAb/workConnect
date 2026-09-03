"use client";

import { useEffect, useState } from "react";

import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { getPendingWorkers, approveWorker } from "@/services/admin.service";

export default function PendingWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingIds, setSubmittingIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadWorkers() {
      try {
        setLoading(true);
        setError("");

        const data = await getPendingWorkers();

        if (mounted) {
          setWorkers(data);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load pending workers right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadWorkers();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleApprove(workerId) {
    try {
      setSubmittingIds((current) => [...current, workerId]);
      await approveWorker(workerId);
      setWorkers((current) => current.filter((worker) => worker.workerId !== workerId));
    } catch (err) {
      alert(err.message || "Unable to approve this worker.");
    } finally {
      setSubmittingIds((current) => current.filter((id) => id !== workerId));
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-gray-900">
          Pending Verification
        </h1>

        <p className="mt-2 text-gray-500">
          Review workers waiting for approval before they can start taking jobs.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <Card className="col-span-full rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            Loading workers...
          </Card>
        ) : error ? (
          <Card className="col-span-full rounded-2xl border border-red-100 bg-red-50 p-8 text-center text-red-600">
            {error}
          </Card>
        ) : workers.length === 0 ? (
          <Card className="col-span-full rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            No workers pending verification
          </Card>
          ) : (
            workers.map((worker, index) => (
            <div
            key={`${worker.workerId ?? worker.id ?? "worker"}-${index}`}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={null}
                    alt={worker.fullName || "Worker"}
                    size="lg"
                  />

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {worker.fullName || "Worker"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {worker.headline || "Skilled professional"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">City</span>
                  <span className="font-medium text-gray-900">
                    {worker.city || "Not specified"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Rate</span>
                  <span className="font-medium text-gray-900">
                    {worker.hourlyRateEtb ? `ETB ${Number(worker.hourlyRateEtb).toLocaleString()}` : "Not set"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Rating</span>
                  <span className="font-medium text-gray-900">
                    {Number(worker.ratingAverage || 0).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Jobs</span>
                  <span className="font-medium text-gray-900">
                    {worker.completedJobs ?? 0}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  fullWidth
                  disabled={submittingIds.includes(worker.workerId)}
                  onClick={() => handleApprove(worker.workerId)}
                >
                  {submittingIds.includes(worker.workerId)
                    ? "Updating..."
                    : "Approve"}
                </Button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
