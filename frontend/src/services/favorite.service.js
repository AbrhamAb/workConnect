// src/services/favorite.service.js

import { getCurrentUser } from "./auth.service";

import { findMany, findOne, insertOne, deleteOne } from "./storage.service";

function idsMatch(firstId, secondId, prefix) {
  if (
    firstId === null ||
    firstId === undefined ||
    secondId === null ||
    secondId === undefined
  ) {
    return false;
  }

  const first = String(firstId);
  const second = String(secondId);

  return (
    first === second ||
    first === `${prefix}-${second}` ||
    second === `${prefix}-${first}`
  );
}

function favoriteBelongsTo(favorite, customerId, workerId) {
  return (
    idsMatch(favorite.customerId, customerId, "cust") &&
    idsMatch(favorite.workerId, workerId, "worker")
  );
}

/**
 * Returns every favorite.
 */
export async function getFavorites() {
  return findMany("favorites").sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

/**
 * Returns every favorite belonging to a customer.
 */
export async function getCustomerFavorites(customerId) {
  return findMany("favorites", (favorite) =>
    idsMatch(favorite.customerId, customerId, "cust"),
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Returns the logged-in customer's favorites.
 */
export async function getCurrentCustomerFavorites() {
  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can have favorite workers.");
  }

  return findMany("favorites", (favorite) =>
    idsMatch(favorite.customerId, customer.id, "cust"),
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Returns the ids of every worker favorited by a customer.
 */
export async function getFavoriteWorkerIds(customerId) {
  return findMany("favorites", (favorite) =>
    idsMatch(favorite.customerId, customerId, "cust"),
  ).map((favorite) => favorite.workerId);
}

/**
 * Returns whether a worker is favorited by a customer.
 */
export async function isFavorite(customerId, workerId) {
  return !!findOne("favorites", (favorite) =>
    favoriteBelongsTo(favorite, customerId, workerId),
  );
}

/**
 * Adds a worker to the customer's favorites.
 */
export async function addFavorite(workerId) {
  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can save favorite workers.");
  }

  const existing = findOne("favorites", (favorite) =>
    favoriteBelongsTo(favorite, customer.id, workerId),
  );

  if (existing) {
    return existing;
  }

  const favorite = {
    id: crypto.randomUUID(),

    customerId: customer.id,
    workerId,

    createdAt: new Date().toISOString(),
  };

  return insertOne("favorites", favorite);
}

/**
 * Removes a worker from the customer's favorites.
 */
export async function removeFavorite(workerId) {
  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can remove favorite workers.");
  }

  return deleteOne("favorites", (favorite) =>
    favoriteBelongsTo(favorite, customer.id, workerId),
  );
}

/**
 * Toggles whether a worker is a favorite.
 *
 * Returns:
 * true  -> worker is now favorited
 * false -> worker is no longer favorited
 */
export async function toggleFavorite(workerId) {
  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can manage favorite workers.");
  }

  const existing = findOne("favorites", (favorite) =>
    favoriteBelongsTo(favorite, customer.id, workerId),
  );

  if (existing) {
    deleteOne("favorites", (favorite) =>
      favoriteBelongsTo(favorite, customer.id, workerId),
    );

    return false;
  }

  insertOne("favorites", {
    id: crypto.randomUUID(),

    customerId: customer.id,
    workerId,

    createdAt: new Date().toISOString(),
  });

  return true;
}
