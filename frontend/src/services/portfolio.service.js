import { delay } from "@/lib/delay";

import { findMany, insertOne, updateOne, deleteOne } from "./storage.service";

/**
 * Returns every portfolio item for a worker.
 */
export async function getPortfolioByWorker(workerId) {
  await delay();

  return findMany("portfolio", (item) => item.workerId === workerId);
}

/**
 * Creates a new portfolio item for a worker.
 */
export async function createPortfolioItem(data) {
  await delay();

  const portfolioItem = {
    id: crypto.randomUUID(),
    workerId: data.workerId,
    image: data.image,
    title: data.title || "Project",
    description: data.description || "",
    createdAt: new Date().toISOString(),
  };

  return insertOne("portfolio", portfolioItem);
}

/**
 * Updates a portfolio item.
 */
export async function updatePortfolioItem(itemId, updates) {
  await delay();

  return updateOne("portfolio", (item) => item.id === itemId, updates);
}

/**
 * Deletes a portfolio item. 
 */
export async function deletePortfolioItem(itemId) {
  await delay();

  return deleteOne("portfolio", (item) => item.id === itemId);
}
