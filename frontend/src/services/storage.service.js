// src/services/storage.service.js

import { users } from "@/mock/data/users";
import { professions } from "@/mock/data/professions";
import { workerProfiles } from "@/mock/data/workerProfiles";
import { requests } from "@/mock/data/requests";
import { portfolio } from "@/mock/data/portfolio";
import { reviews } from "@/mock/data/reviews";
import { favorites } from "@/mock/data/favorites";

const STORAGE_KEY = "workconnect-db";

const INITIAL_DATABASE = {
  users,
  professions,
  workerProfiles,
  requests,
  portfolio,
  reviews,
  favorites,
};

/**
 * Creates or repairs the mock database stored in localStorage.
 *
 * If the database already exists, any missing collections are restored
 * without overwriting existing data.
 */
export function initializeDatabase() {
  const existing = localStorage.getItem(STORAGE_KEY);

  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
    return;
  }

  let database;

  try {
    database = JSON.parse(existing);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
    return;
  }

  let updated = false;

  Object.entries(INITIAL_DATABASE).forEach(([collectionName, seedData]) => {
    if (!Array.isArray(database[collectionName])) {
      database[collectionName] = [...seedData];
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  }
}

/**
 * Returns the entire database.
 */
export function getDatabase() {
  initializeDatabase();

  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

/**
 * Replaces the entire database.
 */
export function saveDatabase(database) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

/**
 * Returns one collection.
 *
 * Example:
 * getCollection("users")
 */
export function getCollection(collectionName) {
  const database = getDatabase();

  return database[collectionName] ?? [];
}

/**
 * Replaces one collection.
 */
export function saveCollection(collectionName, collection) {
  const database = getDatabase();

  database[collectionName] = collection;

  saveDatabase(database);
}

/**
 * Finds the first item matching a predicate.
 */
export function findOne(collectionName, predicate) {
  return getCollection(collectionName).find(predicate);
}

/**
 * Returns every matching item.
 */
export function findMany(collectionName, predicate) {
  return getCollection(collectionName).filter(predicate);
}

/**
 * Inserts an item into a collection.
 */
export function insert(collectionName, item) {
  const collection = getCollection(collectionName);

  collection.push(item);

  saveCollection(collectionName, collection);

  return item;
}

/**
 * Inserts an item into a collection.
 *
 * This alias matches the service layer convention used by the app.
 */
export function insertOne(collectionName, item) {
  return insert(collectionName, item);
}

/**
 * Updates the first matching item.
 */
export function updateOne(collectionName, predicate, updates) {
  const collection = getCollection(collectionName);

  const index = collection.findIndex(predicate);

  if (index === -1) {
    return null;
  }

  collection[index] = {
    ...collection[index],
    ...updates,
  };

  saveCollection(collectionName, collection);

  return collection[index];
}

/**
 * Deletes a single item from a collection.
 *
 * Example:
 * deleteOne("requests", request => request.id === requestId)
 */
export function deleteOne(collectionName, predicate) {
  const database = getDatabase();

  const collection = database[collectionName];

  const index = collection.findIndex(predicate);

  if (index === -1) {
    return false;
  }

  const [deletedItem] = collection.splice(index, 1);

  saveDatabase(database);

  return deletedItem;
}

/**
 * Removes the first matching item.
 */
export function removeOne(collectionName, predicate) {
  const collection = getCollection(collectionName);

  const index = collection.findIndex(predicate);

  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);

  saveCollection(collectionName, collection);

  return true;
}

/**
 * Completely resets the mock database.
 *
 * Useful during development.
 */
export function resetDatabase() {
  localStorage.removeItem(STORAGE_KEY);

  initializeDatabase();
}
