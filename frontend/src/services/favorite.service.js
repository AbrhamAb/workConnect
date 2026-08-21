import { delay } from "@/lib/delay";
import { apiDelete, apiGet, apiPost } from "./api.service";
import { getCurrentUser } from "./auth.service";

function toNumericWorkerId(workerId) {
  const numericId = Number(String(workerId).replace(/^worker-/, ""));
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function normalizeFavorite(favorite) {
  const numericWorkerId = Number(favorite?.workerId);
  const workerId = `worker-${numericWorkerId}`;

  return {
    ...favorite,
    id: workerId,
    favoriteId: favorite?.id,
    workerId,
    numericWorkerId,
    name: favorite?.fullName || "Worker",
    fullName: favorite?.fullName || "Worker",
    profession: favorite?.primaryCategoryName || favorite?.headline || "Skilled Professional",
    rating: favorite?.ratingAverage || 0,
    avatar: favorite?.profileImage || "/api/placeholder/150/150",
  };
}

function requireCustomer() {
  const customer = getCurrentUser();
  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can manage favorite workers.");
  }
  return customer;
}

/**
 * Returns every favorite.
 */
export async function getFavorites() {
  await delay();
  requireCustomer();
  const response = await apiGet("/customer/favorites");
  return (response?.favorites || []).map(normalizeFavorite);
}

/**
 * Returns every favorite belonging to a customer.
 */
export async function getCustomerFavorites(customerId) {
  return getCurrentCustomerFavorites(customerId);
}

/**
 * Returns the logged-in customer's favorites.
 */
export async function getCurrentCustomerFavorites() {
  await delay();
  requireCustomer();
  const response = await apiGet("/customer/favorites");
  return (response?.favorites || []).map(normalizeFavorite);
}

/**
 * Returns the ids of every worker favorited by a customer.
 */
export async function getFavoriteWorkerIds(customerId) {
  const favorites = await getCustomerFavorites(customerId);
  return favorites.map((favorite) => favorite.workerId);
}

/**
 * Returns whether a worker is favorited by a customer.
 */
export async function isFavorite(customerId, workerId) {
  await delay();
  requireCustomer();
  const numericWorkerId = toNumericWorkerId(workerId);
  if (!numericWorkerId) return false;
  const response = await apiGet(`/customer/favorites/${numericWorkerId}/status`);
  return Boolean(response?.favorited);
}

/**
 * Adds a worker to the customer's favorites.
 */
export async function addFavorite(workerId) {
  await delay();
  requireCustomer();
  const numericWorkerId = toNumericWorkerId(workerId);
  if (!numericWorkerId) throw new Error("Invalid worker id.");
  const response = await apiPost(`/customer/favorites/${numericWorkerId}`);
  return normalizeFavorite(response?.favorite || response);
}

/**
 * Removes a worker from the customer's favorites.
 */
export async function removeFavorite(workerId) {
  await delay();
  requireCustomer();
  const numericWorkerId = toNumericWorkerId(workerId);
  if (!numericWorkerId) throw new Error("Invalid worker id.");
  await apiDelete(`/customer/favorites/${numericWorkerId}`);
  return true;
}

/**
 * Toggles whether a worker is a favorite.
 *
 * Returns:
 * true  -> worker is now favorited
 * false -> worker is no longer favorited
 */
export async function toggleFavorite(workerId) {
  await delay();
  requireCustomer();
  const numericWorkerId = toNumericWorkerId(workerId);
  if (!numericWorkerId) throw new Error("Invalid worker id.");
  const status = await apiGet(`/customer/favorites/${numericWorkerId}/status`);
  if (status?.favorited) {
    await apiDelete(`/customer/favorites/${numericWorkerId}`);
    return false;
  }
  await apiPost(`/customer/favorites/${numericWorkerId}`);
  return true;
}
