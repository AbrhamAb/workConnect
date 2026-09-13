import { findMany, insertOne, updateOne, deleteOne } from "./storage.service";

/**
 * Returns every portfolio item for a worker.
 */
export async function getPortfolioByWorker(workerId) {
  
  return findMany("portfolio", (item) => item.workerId === workerId);
}

/**
 * Creates a new portfolio item for a worker.
 */
export async function createPortfolioItem(data) {
  
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
  
  return updateOne("portfolio", (item) => item.id === itemId, updates);
}

/**
 * Deletes a portfolio item. 
 */
export async function deletePortfolioItem(itemId) {
  
  return deleteOne("portfolio", (item) => item.id === itemId);
}
