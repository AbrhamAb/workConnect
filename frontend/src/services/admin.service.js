import { apiGet, apiPatch } from "./api.service";

export async function getPendingWorkers() {
  const response = await apiGet("/admin/workers/pending-verification");
  return response?.workers || [];
}

export async function approveWorker(workerId) {
  const numericWorkerId = Number(workerId);

  if (!Number.isFinite(numericWorkerId) || numericWorkerId <= 0) {
    throw new Error("Invalid worker id.");
  }

  return apiPatch(`/admin/workers/${numericWorkerId}/verify`, {});
}
