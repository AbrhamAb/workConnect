import { delay } from "@/lib/delay";

import { apiGet, apiPatch, apiPost } from "./api.service";
import { apiDelete } from "./api.service";
import { getCurrentUser } from "./auth.service";
import { getWorkerById } from "./worker.service";
import { findMany, findOne, insertOne, updateOne, deleteOne } from "./storage.service";

const PLACEHOLDER_AVATAR = "/api/placeholder/150/150";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toNumericId(value, prefix) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value);
  const stripped = prefix ? raw.replace(new RegExp(`^${prefix}-`), "") : raw;
  const numeric = Number(stripped);

  return Number.isNaN(numeric) ? null : numeric;
}

function toLegacyRequestId(requestId) {
  if (requestId === null || requestId === undefined || requestId === "") {
    return null;
  }

  const raw = String(requestId);
  return raw.startsWith("req-") ? raw : `req-${raw}`;
}

function toLegacyWorkerId(workerId) {
  if (workerId === null || workerId === undefined || workerId === "") {
    return null;
  }

  const raw = String(workerId);
  return raw.startsWith("worker-") ? raw : `worker-${raw}`;
}

function toLegacyCustomerId(customerId) {
  if (customerId === null || customerId === undefined || customerId === "") {
    return null;
  }

  const raw = String(customerId);
  return raw.startsWith("cust-") ? raw : `cust-${raw}`;
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    fullName:
      user.fullName ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.name ||
      "",
  };
}

function normalizeRequest(request) {
  if (!request) {
    return null;
  }

  const preferredAt = request.preferredAt ? new Date(request.preferredAt) : null;

  return {
    id: toLegacyRequestId(request.id ?? request.requestId),
    requestId: request.id ?? request.requestId ?? null,
    customerId: toLegacyCustomerId(request.customerId),
    workerId: toLegacyWorkerId(request.workerId),

    title: request.title || "Service Request",
    description: request.description || "No description provided.",
    location: request.locationAddress || request.location || "Location not specified",
    preferredDate: preferredAt && !Number.isNaN(preferredAt.getTime())
      ? preferredAt.toISOString().split("T")[0]
      : request.preferredDate || null,
    preferredTime: preferredAt && !Number.isNaN(preferredAt.getTime())
      ? preferredAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : request.preferredTime || null,
    budget: request.budgetEtb ?? request.budget ?? null,
    photos: request.photos || [],
    images: request.images || [],

    status: request.status || "pending",
    createdAt: request.createdAt || null,
    updatedAt: request.updatedAt || null,

    categoryName: request.categoryName || "",
    workerName: request.workerName || "",
    customerName: request.customerName || "",
    customerPhone: request.customerPhone || "",

    request,
  };
}

function normalizeWorker(worker) {
  if (!worker) {
    return null;
  }

  const workerId = toLegacyWorkerId(worker.id ?? worker.workerId ?? worker.userId);

  return {
    id: workerId,
    workerId: worker.workerId ?? toNumericId(workerId, "worker"),
    userId: worker.userId ?? null,
    fullName: worker.fullName || worker.name || "Worker",
    name: worker.fullName || worker.name || "Worker",
    profession: worker.primarySkill || worker.primaryCategoryName || "Skilled professional",
    rating: worker.rating || worker.ratingAverage || 0,
    reviews: worker.totalReviews || worker.ratingCount || 0,
    verified: worker.verified ?? worker.isVerified ?? false,
    avatar: worker.profileImage || PLACEHOLDER_AVATAR,
    profileImage: worker.profileImage || PLACEHOLDER_AVATAR,
    phone: worker.phone || "",
    email: worker.email || "",
    city: worker.city || "",
    skills: worker.skills || [],
    bio: worker.bio || "",
    worker,
  };
}

function normalizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  const customerId = toLegacyCustomerId(customer.id ?? customer.customerId);

  return {
    id: customerId,
    customerId: customer.customerId ?? toNumericId(customerId, "cust"),
    userId: customer.userId ?? customer.id ?? null,
    fullName: customer.fullName || customer.name || "Customer",
    name: customer.fullName || customer.name || "Customer",
    phone: customer.phone || "",
    email: customer.email || "",
    profileImage: customer.profileImage || PLACEHOLDER_AVATAR,
    avatar: customer.profileImage || PLACEHOLDER_AVATAR,
    city: customer.city || "",
    role: customer.role || "customer",
    customer,
  };
}

export async function getRequests() {
  await delay();

  return findMany("requests").sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export async function getRequestById(requestId) {
  await delay();

  return findOne("requests", (request) => request.id === requestId);
}

export async function createRequest(data) {
  await delay();

  const customer = getCurrentUser();

  if (!customer || customer.role !== "customer") {
    throw new Error("Only customers can create requests.");
  }

  const workerId = toNumericId(data.workerId, "worker");

  if (!workerId) {
    throw new Error("Please select a worker before sending the request.");
  }

  const preferredAt =
    data.preferredAt ||
    (data.date ? `${data.date}T00:00:00Z` : null);

  const response = await apiPost("/customer/requests", {
    workerId,
    title: data.title,
    description: data.description,
    locationAddress: data.location,
    preferredAt,
    budgetEtb: Number(data.budget) || 0,
  });

  const request = normalizeRequest(response?.request || response);
  const requestId = request?.requestId;
  if (requestId && Array.isArray(data.photos)) {
    for (const file of data.photos) {
      const photoUrl = await fileToBase64(file);
      await apiPost(`/customer/requests/${requestId}/photos`, { photoUrl });
    }
  }

  return request;
}

export async function updateRequest(requestId, updates) {
  await delay();

  return updateOne("requests", (request) => request.id === requestId, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteRequest(requestId) {
  await delay();

  return deleteOne("requests", (request) => request.id === requestId);
}

export async function getCustomerRequestDetails(requestId) {
  await delay();

  const numericRequestId = toNumericId(requestId, "req");

  if (!numericRequestId) {
    return null;
  }

  const response = await apiGet(`/customer/requests/${numericRequestId}`);

  const photosResponse = await apiGet(`/customer/requests/${numericRequestId}/photos`);
  return {
    request: normalizeRequest(response?.request || response),
    worker: normalizeWorker(response?.worker),
    photos: photosResponse?.photos || [],
  };
}

export async function getWorkerRequestDetails(requestId) {
  await delay();

  const numericRequestId = toNumericId(requestId, "req");

  if (!numericRequestId) {
    return null;
  }

  const response = await apiGet(`/worker/requests/${numericRequestId}`);

  const photosResponse = await apiGet(`/worker/requests/${numericRequestId}/photos`);
  return {
    request: normalizeRequest(response?.request || response),
    customer: normalizeCustomer(response?.customer),
    photos: photosResponse?.photos || [],
  };
}

export async function deleteRequestPhoto(requestId, photoId) {
  const numericRequestId = toNumericId(requestId, "req");
  const numericPhotoId = toNumericId(photoId, "photo");
  if (!numericRequestId || !numericPhotoId) {
    throw new Error("Invalid request or photo id.");
  }
  await apiDelete(`/customer/requests/${numericRequestId}/photos/${numericPhotoId}`);
}

async function updateWorkerRequestStatus(requestId, path, body) {
  const numericRequestId = toNumericId(requestId, "req");

  if (!numericRequestId) {
    throw new Error("Invalid request id.");
  }

  const response = await apiPatch(`/worker/requests/${numericRequestId}${path}`, body);
  return normalizeRequest(response?.request || response);
}

async function updateCustomerRequestStatus(requestId, path) {
  const numericRequestId = toNumericId(requestId, "req");

  if (!numericRequestId) {
    throw new Error("Invalid request id.");
  }

  const response = await apiPatch(`/customer/requests/${numericRequestId}${path}`);
  return normalizeRequest(response?.request || response);
}

export async function acceptRequest(requestId) {
  return updateWorkerRequestStatus(requestId, "/decision", { decision: "accept" });
}

export async function declineRequest(requestId) {
  return updateWorkerRequestStatus(requestId, "/decision", { decision: "reject" });
}

export async function startRequest(requestId) {
  return updateWorkerRequestStatus(requestId, "/start");
}

export async function completeRequest(requestId) {
  return updateWorkerRequestStatus(requestId, "/complete");
}

export async function confirmCompletion(requestId) {
  return updateCustomerRequestStatus(requestId, "/confirm");
}

export async function cancelRequest(requestId) {
  return updateCustomerRequestStatus(requestId, "/cancel");
}
