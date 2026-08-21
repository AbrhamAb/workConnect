"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/card";
import { apiGet, apiPatch } from "@/services/api.service";

export default function VerificationRequestsPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);

  async function loadPendingWorkers() {
    try {
      setLoading(true);
      setError("");
      const response = await apiGet("/admin/workers/pending-verification");
      setWorkers(response?.workers || []);
    } catch (err) {
      setError(err.message || "Unable to load verification requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadInitialWorkers() {
      try {
        const response = await apiGet("/admin/workers/pending-verification");
        if (mounted) {
          setWorkers(response?.workers || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Unable to load verification requests.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInitialWorkers();

    return () => {
      mounted = false;
    };
  }, []);

  async function approveWorker(workerId) {
    try {
      setApprovingId(workerId);
      setError("");
      await apiPatch(`/admin/workers/${workerId}/verify`);
      setWorkers((current) => current.filter((worker) => worker.id !== workerId));
    } catch (err) {
      setError(err.message || "Unable to approve this worker.");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Verification Requests</h1>
        <p className="mt-2 text-gray-600">
          Review workers awaiting verification.
        </p>
      </div>

      {error && (
        <Card className="border-red-100 bg-red-50 text-red-700">{error}</Card>
      )}

      {loading ? (
        <Card className="text-gray-500">Loading verification requests...</Card>
      ) : workers.length === 0 ? (
        <Card className="text-gray-500">No pending verification requests.</Card>
      ) : (
        <div className="space-y-4">
          {workers.map((worker) => {
            const workerId = worker.id ?? worker.workerId;
            return (
              <Card key={workerId}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {worker.fullName || worker.name || "Worker"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {worker.primarySkill || worker.primaryCategoryName || "Skilled professional"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Worker ID: {workerId}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => approveWorker(workerId)}
                    disabled={approvingId === workerId}
                    className="rounded-lg bg-[#1A362D] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {approvingId === workerId ? "Approving..." : "Approve"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
