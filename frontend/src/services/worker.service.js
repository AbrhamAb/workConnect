import { delay } from "@/lib/delay";

import { apiGet, apiPost } from "./api.service";
import { getCurrentUser, setCurrentUser } from "./auth.service";
import { getPortfolioByWorker } from "./portfolio.service";
import { getWorkerRating } from "./review.service";

const PLACEHOLDER_AVATAR = null;

function toLegacyWorkerId(workerId) {
  if (workerId === null || workerId === undefined || workerId === "") {
    return null;
  }

  const value = String(workerId);

  return value.startsWith("worker-") ? value : `worker-${value}`;
}

function toWorkerProfileId(workerId) {
  if (workerId === null || workerId === undefined || workerId === "") {
    return null;
  }

  const value = String(workerId);

  if (value.startsWith("worker-")) {
    const numeric = Number(value.replace(/^worker-/, ""));
    return Number.isNaN(numeric) ? null : numeric;
  }

  const numeric = Number(value);
  return Number.isNaN(numeric) ? null : numeric;
}

function formatRequestDate(request) {
  if (!request?.createdAt) {
    return "Pending";
  }

  const createdAt = new Date(request.createdAt);

  if (Number.isNaN(createdAt.getTime())) {
    return "Pending";
  }

  return createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRequestStatus(status) {
  switch (status) {
    case "accepted":
      return "Accepted";
    case "in_progress":
      return "In Progress";
    case "completed":
    case "confirmed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "declined":
      return "Declined";
    default:
      return "Pending";
  }
}

function mapWorkerCard(worker) {
  if (!worker) {
    return null;
  }

  const workerId = toLegacyWorkerId(worker.workerId ?? worker.id ?? worker.userId);

  return {
    id: workerId,
    workerId: worker.workerId ?? toWorkerProfileId(workerId),
    userId: worker.userId ?? null,

    fullName: worker.fullName || "Worker",
    name: worker.fullName || worker.name || "Worker",

    headline: worker.headline || "Skilled professional",
    primarySkill: worker.primaryCategoryName || worker.primarySkill || "Skilled professional",
    city: worker.city || "Addis Ababa",
    hourlyRateEtb: worker.hourlyRateEtb ?? worker.hourlyRateETB ?? 0,
    rating: worker.ratingAverage ?? worker.rating ?? 0,
    totalReviews: worker.ratingCount ?? worker.totalReviews ?? 0,
    verified: worker.isVerified ?? worker.verified ?? false,
    availability: worker.availabilityStatus || worker.availability || "available",
    completedJobs: worker.completedJobs ?? 0,

    profileImage: worker.profileImage || PLACEHOLDER_AVATAR,
    avatar: worker.profileImage || PLACEHOLDER_AVATAR,

    skills: worker.skills || [],
    bio: worker.bio || "",
    phone: worker.phone || "",
    email: worker.email || "",
  };
}

function mapWorkerDetails(response) {
  if (!response?.worker) {
    return null;
  }

  const details = response.worker;
  const worker = details.worker || details;

  return mapWorkerCard({
    ...worker,
    bio: details.bio || response.bio,
    phone: details.phone || response.phone,
    email: details.email || response.email,
    skills: details.skills || response.skills,
  });
}

function mergeCurrentSession(worker) {
  const session = getCurrentUser();

  if (!worker || !session || session.role !== "worker") {
    return worker;
  }

  const sessionWorkerProfileId = session.workerProfileId ?? toWorkerProfileId(worker.id);

  return {
    ...worker,
    fullName: session.fullName || worker.fullName,
    name: session.fullName || worker.name,
    email: session.email || worker.email,
    phone: session.phone || worker.phone,
    city: session.city || worker.city,
    profileImage: session.profileImage || worker.profileImage,
    avatar: session.profileImage || worker.avatar,
    workerId: sessionWorkerProfileId ?? worker.workerId,
    id: toLegacyWorkerId(sessionWorkerProfileId ?? worker.workerId),
  };
}

function normalizeRequest(request) {
  if (!request) {
    return null;
  }

  const requestId = request.id ?? request.requestId;
  const preferredAt = request.preferredAt ? new Date(request.preferredAt) : null;
  const preferredDate = preferredAt && !Number.isNaN(preferredAt.getTime())
    ? preferredAt.toISOString().split("T")[0]
    : null;
  const preferredTime = preferredAt && !Number.isNaN(preferredAt.getTime())
    ? preferredAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return {
    id: requestId ? `req-${requestId}` : null,
    requestId: requestId ?? null,
    customerId: request.customerId ? `cust-${request.customerId}` : null,
    workerId: request.workerId ? `worker-${request.workerId}` : null,

    title: request.title || "Service Request",
    description: request.description || "No description provided.",
    location: request.locationAddress || request.location || "Location not specified",
    preferredDate,
    preferredTime,
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

function buildRequestCard(request) {
  return {
    id: request.id,
    customer: request.customerName || "Customer",
    avatar: PLACEHOLDER_AVATAR,
    title: request.title,
    location: request.location,
    date: formatRequestDate(request),
    budget: request.budget ? `ETB ${Number(request.budget).toLocaleString()}` : "Negotiable",
    status: request.status,
    statusLabel: formatRequestStatus(request.status),
    description: request.description,
    request,
  };
}

async function getBackendSession() {
  const session = getCurrentUser();

  if (!session?.token) {
    return session;
  }

  if (session.role !== "worker" || session.workerProfileId) {
    return session;
  }

  try {
    const response = await apiGet("/auth/me");
    const refreshedSession = {
      ...session,
      ...(response.user || {}),
      workerProfileId: response.workerProfileId ?? session.workerProfileId ?? null,
      token: session.token,
    };

    setCurrentUser(refreshedSession);

    return refreshedSession;
  } catch {
    return session;
  }
}

export async function getCurrentWorker() {
  await delay();

  const session = await getBackendSession();

  if (!session || session.role !== "worker") {
    return null;
  }

  const workerProfileId = session.workerProfileId ?? toWorkerProfileId(session.id);

  if (!workerProfileId) {
    return mergeCurrentSession(null);
  }

  const worker = await getWorkerById(workerProfileId);

  return mergeCurrentSession(worker);
}

export async function getWorkers() {
  await delay();

  const response = await apiGet("/workers");
  const workers = response?.workers || [];

  const uniqueWorkers = new Map();

  for (const worker of workers) {
    const mappedWorker = mapWorkerCard(worker);

    if (mappedWorker && !uniqueWorkers.has(mappedWorker.workerId)) {
      uniqueWorkers.set(mappedWorker.workerId, mappedWorker);
    }
  }

  return [...uniqueWorkers.values()];
}

export async function getWorkerById(workerId) {
  await delay();

  const numericWorkerId = toWorkerProfileId(workerId);

  if (!numericWorkerId) {
    return null;
  }

  const response = await apiGet(`/workers/${numericWorkerId}`);
  return mapWorkerDetails(response);
}

export async function updateWorker(updates) {
  await delay();

  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return null;
  }

  const workerProfileId = currentUser.workerProfileId ?? toWorkerProfileId(currentUser.id);
  const updatedWorker = {
    ...(await getWorkerById(workerProfileId)),
    ...updates,
  };

  setCurrentUser({
    ...currentUser,
    ...updates,
    workerProfileId,
  });

  return mergeCurrentSession(updatedWorker);
}

export async function getWorkerRequests() {
  await delay();

  const session = await getBackendSession();

  if (!session || session.role !== "worker") {
    return [];
  }

  const response = await apiGet("/worker/requests");
  return (response?.requests || []).map(normalizeRequest).filter(Boolean);
}

export async function getWorkerRequestDetails(requestId) {
  await delay();

  const numericRequestId = Number(String(requestId).replace(/^req-/, ""));

  if (Number.isNaN(numericRequestId) || numericRequestId < 1) {
    return null;
  }

  const response = await apiGet(`/worker/requests/${numericRequestId}`);

  if (!response) {
    return null;
  }

  return {
    request: normalizeRequest(response.request),
    customer: response.customer
      ? {
          id: `cust-${response.customer.id}`,
          customerId: response.customer.id,
          fullName: response.customer.fullName,
          name: response.customer.fullName,
          phone: response.customer.phone || "",
          email: response.customer.email || "",
          profileImage: response.customer.profileImage || PLACEHOLDER_AVATAR,
          avatar: response.customer.profileImage || PLACEHOLDER_AVATAR,
          city: response.customer.city || "",
          role: "customer",
        }
      : null,
  };
}

export async function getWorkerRequestListData() {
  await delay();

  const worker = await getCurrentWorker();

  if (!worker) {
    return {
      worker: null,
      requests: [],
    };
  }

  const requests = await getWorkerRequests();

  return {
    worker,
    requests: requests.map(buildRequestCard),
  };
}

export async function searchWorkers(query) {
  await delay();

  const workers = await getWorkers();

  if (!query?.trim()) {
    return workers;
  }

  const search = query.toLowerCase();

  return workers.filter((worker) => {
    return (
      worker.fullName?.toLowerCase().includes(search) ||
      worker.primarySkill?.toLowerCase().includes(search) ||
      worker.city?.toLowerCase().includes(search) ||
      worker.skills?.some((skill) => skill.toLowerCase().includes(search))
    );
  });
}

export async function getWorkersByProfession(primarySkill) {
  await delay();

  const workers = await getWorkers();
  return workers.filter((worker) => worker.primarySkill === primarySkill);
}

export async function getWorkerDashboardData() {
  await delay();

  const worker = await getCurrentWorker();

  if (!worker) {
    return null;
  }

  const [backendSummary, requests] = await Promise.all([
    apiGet("/worker/dashboard").catch(() => null),
    getWorkerRequests(),
  ]);

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((request) => request.status === "pending").length,
    acceptedRequests: requests.filter((request) => request.status === "accepted").length,
    inProgressRequests: requests.filter((request) => request.status === "in_progress").length,
    completedRequests: requests.filter((request) => request.status === "completed" || request.status === "confirmed").length,
  };

  return {
    worker,
    stats: {
      ...stats,
      backendSummary: backendSummary?.summary || null,
    },
    recentRequests: requests.slice(0, 5),
  };
}

export async function getWorkerPortfolio(workerId) {
  return getPortfolioByWorker(toLegacyWorkerId(workerId));
}

export async function getWorkerProfileData(workerId) {
  await delay();

  const worker = await getWorkerById(workerId);

  if (!worker) {
    return null;
  }

  const [portfolio, rating] = await Promise.all([
    getWorkerPortfolio(worker.id),
    getWorkerRating(worker.id),
  ]);

  return {
    worker,
    portfolio,
    rating,
  };
}

export async function uploadVerificationDocument(document) {
  return apiPost("/worker/verification/documents", document);
}

export async function submitWorkerVerification() {
  return apiPost("/worker/verification/submit", {});
}

export async function getWorkerAnalyticsData() {
  await delay();

  const worker = await getCurrentWorker();

  if (!worker) {
    return null;
  }

  const [requests, portfolio, rating] = await Promise.all([
    getWorkerRequests(),
    getPortfolioByWorker(worker.id),
    getWorkerRating(worker.id),
  ]);

  const completedJobs = requests.filter(
    (request) => request.status === "completed" || request.status === "confirmed",
  );

  const achievements = [
    {
      icon: "🏆",
      title: worker.verified ? "Verified Professional" : "Rising Professional",
      description: worker.verified
        ? "Identity and certificates verified."
        : "Complete verification to unlock more trust.",
    },
    {
      icon: "⭐",
      title: `${completedJobs.length}+ Jobs Completed`,
      description: `Successfully completed ${completedJobs.length} jobs.`,
    },
    {
      icon: "✅",
      title: worker.rating >= 4.8 ? "Top Rated Worker" : "Consistently Reliable",
      description:
        worker.rating >= 4.8
          ? "Maintain a rating above 4.8."
          : "Keep delivering excellent service.",
    },
    {
      icon: "📸",
      title: portfolio.length > 0 ? "Portfolio Available" : "Portfolio Pending",
      description:
        portfolio.length > 0
          ? "Customers can view your previous work."
          : "Add portfolio items to build trust.",
    },
  ];

  return {
    worker,
    stats: {
      completedJobs: completedJobs.length,
      averageRating: rating.rating,
      totalReviews: rating.totalReviews,
    },
    achievements,
    summary: {
      verificationStatus: worker.verified ? "Verified" : "Pending Verification",
    },
  };
}

export async function getWorkerPortfolioData() {
  await delay();

  const worker = await getCurrentWorker();

  if (!worker) {
    return null;
  }

  const portfolio = await getPortfolioByWorker(worker.id);

  return {
    worker,
    portfolio,
  };
}

export async function getCurrentWorkerProfileData() {
  await delay();

  const worker = await getCurrentWorker();

  if (!worker) {
    return null;
  }

  const [portfolio, rating] = await Promise.all([
    getPortfolioByWorker(worker.id),
    getWorkerRating(worker.id),
  ]);

  return {
    worker: {
      ...worker,
      rating: rating.rating,
      totalReviews: rating.totalReviews,
    },
    portfolio,
    stats: {
      portfolioCount: portfolio.length,
      rating: rating.rating,
      totalReviews: rating.totalReviews,
    },
  };
}
