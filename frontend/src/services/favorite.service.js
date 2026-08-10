// src/services/favorite.service.js

import { delay } from "@/lib/delay";

import { getCurrentUser } from "./auth.service";

import { findMany, findOne, insertOne, deleteOne } from "./storage.service";

/**
 * Returns every favorite.
 */
export async function getFavorites() {
  await delay();

  return findMany("favorites").sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

/**
 * Returns every favorite belonging to a customer.
 */
export async function getCustomerFavorites(customerId) {
  await delay();

  return findMany(
    "favorites",
    (favorite) => favorite.customerId === customerId,
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Returns the logged-in customer's favorites.
 */
export async function getCurrentCustomerFavorites() {
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can have favorite workers.");
  }

  return findMany(
    "favorites",
    (favorite) => favorite.customerId === customer.id,
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Returns the ids of every worker favorited by a customer.
 */
export async function getFavoriteWorkerIds(customerId) {
  await delay();

  return findMany(
    "favorites",
    (favorite) => favorite.customerId === customerId,
  ).map((favorite) => favorite.workerId);
}

/**
 * Returns whether a worker is favorited by a customer.
 */
export async function isFavorite(customerId, workerId) {
  await delay();

  return !!findOne(
    "favorites",
    (favorite) =>
      favorite.customerId === customerId && favorite.workerId === workerId,
  );
}

/**
 * Adds a worker to the customer's favorites.
 */
export async function addFavorite(workerId) {
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can save favorite workers.");
  }

  const worker = findOne(
    "users",
    (user) => user.id === workerId && user.role === "worker",
  );

  if (!worker) {
    throw new Error("Worker not found.");
  }

  const existing = findOne(
    "favorites",
    (favorite) =>
      favorite.customerId === customer.id && favorite.workerId === workerId,
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
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can remove favorite workers.");
  }

  return deleteOne(
    "favorites",
    (favorite) =>
      favorite.customerId === customer.id && favorite.workerId === workerId,
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
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can manage favorite workers.");
  }

  const worker = findOne(
    "users",
    (user) => user.id === workerId && user.role === "worker",
  );

  if (!worker) {
    throw new Error("Worker not found.");
  }

  const existing = findOne(
    "favorites",
    (favorite) =>
      favorite.customerId === customer.id && favorite.workerId === workerId,
  );

  if (existing) {
    deleteOne(
      "favorites",
      (favorite) =>
        favorite.customerId === customer.id && favorite.workerId === workerId,
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
