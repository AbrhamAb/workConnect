import { delay } from "@/lib/delay";

import { apiDelete, apiGet, apiPatch, apiPost } from "./api.service";

function toNumericWorkerId(workerId) {
  const numericId = Number(String(workerId).replace(/^worker-/, ""));
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function toNumericPortfolioId(itemId) {
  const numericId = Number(String(itemId).replace(/^portfolio-/, ""));
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function normalizePortfolioItem(item) {
  if (!item) {
    return null;
  }

  return {
    ...item,
    image: item.image || item.coverImageUrl || "",
    title: item.title || "Project",
    description: item.description || "",
  };
}

/**
 * Returns every portfolio item for a worker.
 */
export async function getPortfolioByWorker(workerId) {
  await delay();

  const numericWorkerId = toNumericWorkerId(workerId);
  if (!numericWorkerId) {
    return [];
  }

  const response = await apiGet(`/workers/${numericWorkerId}/portfolio`, { auth: false });
  return (response?.portfolio || []).map(normalizePortfolioItem).filter(Boolean);
}

/**
 * Creates a new portfolio item for a worker.
 */
export async function createPortfolioItem(data) {
  await delay();

  const response = await apiPost("/worker/portfolio", {
    image: data.image,
    title: data.title || "Project",
    description: data.description || "",
  });

  return normalizePortfolioItem(response?.portfolio || response);
}

/**
 * Updates a portfolio item.
 */
export async function updatePortfolioItem(itemId, updates) {
  await delay();

  const numericItemId = toNumericPortfolioId(itemId);
  if (!numericItemId) {
    throw new Error("Invalid portfolio item id.");
  }

  const response = await apiPatch(`/worker/portfolio/${numericItemId}`, {
    image: updates.image,
    title: updates.title || "Project",
    description: updates.description || "",
  });

  return normalizePortfolioItem(response?.portfolio || response);
}

/**
 * Deletes a portfolio item. 
 */
export async function deletePortfolioItem(itemId) {
  await delay();

  const numericItemId = toNumericPortfolioId(itemId);
  if (!numericItemId) {
    throw new Error("Invalid portfolio item id.");
  }

  await apiDelete(`/worker/portfolio/${numericItemId}`);
  return true;
}
