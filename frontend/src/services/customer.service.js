import { delay } from "@/lib/delay";

import { apiGet } from "./api.service";
import { getCurrentUser, setCurrentUser } from "./auth.service";
import { getWorkerById } from "./worker.service";

const PLACEHOLDER_AVATAR = null;

function toLegacyCustomerId(customerId) {
  if (customerId === null || customerId === undefined || customerId === "") {
    return null;
  }

  const value = String(customerId);
  return value.startsWith("cust-") ? value : `cust-${value}`;
}

function toCustomerUserId(customerId) {
  if (customerId === null || customerId === undefined || customerId === "") {
    return null;
  }

  const value = String(customerId);
  const numeric = Number(value.replace(/^cust-/, ""));

  return Number.isNaN(numeric) ? null : numeric;
}

function mapCustomer(user) {
  if (!user) {
    return null;
  }

  const customerId = toLegacyCustomerId(user.id ?? user.customerId);

  return {
    id: customerId,
    customerId: toCustomerUserId(customerId),
    userId: user.id ?? null,

    fullName: user.fullName || "Customer",
    name: user.fullName || user.name || "Customer",
    email: user.email || "",
    phone: user.phone || "",
    city: user.city || "",
    profileImage: user.profileImage || PLACEHOLDER_AVATAR,
    avatar: user.profileImage || PLACEHOLDER_AVATAR,
    role: user.role || "customer",
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
  };
}

function normalizeRequest(request) {
  if (!request) {
    return null;
  }

  const requestId = request.id ?? request.requestId;
  const preferredAt = request.preferredAt ? new Date(request.preferredAt) : null;

  return {
    id: requestId ? `req-${requestId}` : null,
    requestId: requestId ?? null,
    customerId: request.customerId ? `cust-${request.customerId}` : null,
    workerId: request.workerId ? `worker-${request.workerId}` : null,

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

function mergeCurrentSession(customer) {
  const session = getCurrentUser();

  if (!customer || !session || session.role !== "customer") {
    return customer;
  }

  return {
    ...customer,
    fullName: session.fullName || customer.fullName,
    name: session.fullName || customer.name,
    email: session.email || customer.email,
    phone: session.phone || customer.phone,
    city: session.city || customer.city,
    profileImage: session.profileImage || customer.profileImage,
    avatar: session.profileImage || customer.avatar,
    id: toLegacyCustomerId(session.id ?? customer.customerId),
    customerId: session.id ?? customer.customerId,
  };
}

async function getBackendSession() {
  const session = getCurrentUser();

  if (!session?.token) {
    return session;
  }

  if (session.role !== "customer") {
    return session;
  }

  try {
    const response = await apiGet("/auth/me");
    const refreshedSession = {
      ...session,
      ...(response.user || {}),
      token: session.token,
    };

    setCurrentUser(refreshedSession);
    return refreshedSession;
  } catch {
    return session;
  }
}

export async function getCurrentCustomer() {
  await delay();

  const session = await getBackendSession();

  if (!session || session.role !== "customer") {
    return null;
  }

  return mergeCurrentSession(mapCustomer(session));
}

export async function getCustomerById(customerId) {
  await delay();

  const currentCustomer = await getCurrentCustomer();
  const targetId = toLegacyCustomerId(customerId);

  if (currentCustomer && currentCustomer.id === targetId) {
    return currentCustomer;
  }

  return null;
}

export async function updateCustomer(updates) {
  await delay();

  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "customer") {
    return null;
  }

  const updatedCustomer = {
    ...currentUser,
    ...updates,
  };

  setCurrentUser(updatedCustomer);

  return mergeCurrentSession(mapCustomer(updatedCustomer));
}

export async function getCustomerRequests() {
  await delay();

  const session = await getBackendSession();

  if (!session || session.role !== "customer") {
    return [];
  }

  const response = await apiGet("/customer/requests");
  return (response?.requests || []).map(normalizeRequest).filter(Boolean);
}

export async function getCustomerRequest(requestId) {
  await delay();

  const numericRequestId = Number(String(requestId).replace(/^req-/, ""));

  if (Number.isNaN(numericRequestId) || numericRequestId < 1) {
    return null;
  }

    const response = await apiGet(`/customer/requests/${numericRequestId}`);

    return normalizeRequest(response?.request || response);
}

export async function getCustomerDashboardData() {
  await delay();

  const customer = await getCurrentCustomer();

  if (!customer) {
    return null;
  }

  const [backendSummary, requests] = await Promise.all([
    apiGet("/customer/dashboard").catch(() => null),
    getCustomerRequests(),
  ]);

  const recentRequests = [];

  for (const request of requests.slice(0, 5)) {
    const worker = request.workerId ? await getWorkerById(request.workerId) : null;

    recentRequests.push({
      ...request,
      worker,
    });
  }

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((request) => request.status === "pending").length,
    activeRequests: requests.filter(
      (request) => request.status === "accepted" || request.status === "in_progress",
    ).length,
    completedRequests: requests.filter((request) => request.status === "completed" || request.status === "confirmed").length,
  };

  return {
    customer,
    stats: {
      ...stats,
      backendSummary: backendSummary?.summary || null,
    },
    recentRequests,
  };
}

export async function getCustomerProfileData() {
  await delay();

  const customer = await getCurrentCustomer();

  if (!customer) {
    return null;
  }

  const requests = await getCustomerRequests();
  const favoriteWorkers = await getCustomerFavorites();

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).getFullYear()
    : new Date().getFullYear();

  return {
    customer: {
      ...customer,
      name: customer.fullName,
      role: "Customer",
      badge: "Gold Member",
      avatar: customer.profileImage || PLACEHOLDER_AVATAR,
      address: customer.address || customer.city || "Addis Ababa",
      memberSince,
    },
    stats: {
      requests: requests.length,
      completed: requests.filter((request) => request.status === "completed").length,
      favorites: favoriteWorkers.length,
      memberSince,
    },
    favoriteWorkers,
  };
}

export async function getCustomerFavorites() {
  await delay();

  const customer = await getCurrentCustomer();

  if (!customer) {
    return [];
  }

  const requests = await getCustomerRequests();
  const workerIds = [...new Set(requests.map((request) => request.workerId).filter(Boolean))];
  const favorites = [];

  for (const workerId of workerIds.slice(0, 3)) {
    const worker = await getWorkerById(workerId);

    if (worker) {
      favorites.push({
        id: worker.id,
        name: worker.fullName,
        profession: worker.primarySkill || "Skilled Professional",
        rating: worker.rating || 0,
        avatar: worker.profileImage || PLACEHOLDER_AVATAR,
      });
    }
  }

  return favorites;
}
