import { delay } from "@/lib/delay";

import { useAuthStore } from "@/store/authStore";

import { apiGet, apiPatch } from "./api.service";
import { getCurrentUser, setCurrentUser } from "./auth.service";
import { getWorkerRating } from "./review.service";
import { getPortfolioByWorker } from "./portfolio.service";

const PLACEHOLDER_AVATAR = "/api/placeholder/150/150";

function toNumericWorkerId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value);
  const stripped = raw.replace(/^worker-/, "");
  const numeric = Number(stripped);
  return Number.isNaN(numeric) ? null : numeric;
}

function normalizeWorkerCard(worker) {
  if (!worker) {
    return null;
  }

  const workerId = worker.workerId ?? worker.id ?? worker.userId ?? null;

  return {
    id: workerId,
    workerId,
    userId: worker.userId ?? null,
    fullName: worker.fullName || worker.name || "Worker",
    name: worker.fullName || worker.name || "Worker",
    profileImage:
      worker.profileImage || worker.profile_image || worker.avatar || PLACEHOLDER_AVATAR,
    avatar:
      worker.profileImage || worker.profile_image || worker.avatar || PLACEHOLDER_AVATAR,
    headline: worker.headline || "",
    city: worker.city || "",
    primarySkill:
      worker.primarySkill || worker.headline || worker.primaryCategoryName || "Skilled professional",
    rating: worker.ratingAverage ?? worker.rating ?? 0,
    totalReviews: worker.ratingCount ?? worker.totalReviews ?? 0,
    verified: worker.isVerified ?? worker.verified ?? false,
    availability: worker.availabilityStatus ?? worker.availability ?? "",
    completedJobs: worker.completedJobs ?? 0,
    hourlyRateEtb: worker.hourlyRateEtb ?? worker.hourly_rate_etb ?? 0,
    bio: worker.bio || "",
    skills: worker.skills || [],
    phone: worker.phone || "",
    email: worker.email || "",
    experience: worker.experienceYears ?? worker.experience ?? 0,
    worker,
  };
}

function normalizeWorkerDetails(details) {
  if (!details) {
    return null;
  }

  const worker = normalizeWorkerCard(details.worker || details);

  return {
    ...worker,
    bio: details.bio || worker.bio,
    skills: details.skills || worker.skills,
    phone: details.phone || worker.phone,
    email: details.email || worker.email,
  };
}

function normalizeRequest(request) {
  if (!request) {
    return null;
  }

  const preferredAt = request.preferredAt ? new Date(request.preferredAt) : null;

  return {
    id: request.id ? `req-${request.id}` : null,
    requestId: request.id ?? request.requestId ?? null,
    customerId: request.customerId ? `cust-${request.customerId}` : null,
    workerId: request.workerId ? `worker-${request.workerId}` : null,
    title: request.title || "Service Request",
    description: request.description || "No description provided.",
    location: request.locationAddress || request.location || "Location not specified",
    preferredDate:
      preferredAt && !Number.isNaN(preferredAt.getTime())
        ? preferredAt.toISOString().split("T")[0]
        : request.preferredDate || null,
    preferredTime:
      preferredAt && !Number.isNaN(preferredAt.getTime())
        ? preferredAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
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

function normalizeCustomer(customer) {
  if (!customer) {
    return null;
  }

  return {
    ...customer,
    fullName: customer.fullName || customer.name || "Customer",
    name: customer.fullName || customer.name || "Customer",
    profileImage:
      customer.profileImage || customer.profile_image || customer.avatar || PLACEHOLDER_AVATAR,
    avatar:
      customer.profileImage || customer.profile_image || customer.avatar || PLACEHOLDER_AVATAR,
  };
}

async function refreshCurrentSession() {
  const session = getCurrentUser();

  if (!session?.token || session.role !== "worker") {
    return session;
  }

  try {
    const response = await apiGet("/auth/me");
    const refreshedSession = {
      ...session,
      ...(response?.user || {}),
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

  const session = await refreshCurrentSession();

  if (!session || session.role !== "worker") {
    return null;
  }

  const workerId =
    toNumericWorkerId(session.workerProfileId) || toNumericWorkerId(session.id);

  if (!workerId) {
    return null;
  }

  return getWorkerById(workerId);
}

export async function getWorkers() {
  await delay();

  const response = await apiGet("/workers");
  return (response?.workers || []).map(normalizeWorkerCard).filter(Boolean);
}

export async function getWorkerById(workerId) {
  await delay();

  const numericWorkerId = toNumericWorkerId(workerId);

  if (!numericWorkerId) {
    return null;
  }

  const response = await apiGet(`/workers/${numericWorkerId}`);
  return normalizeWorkerDetails(response);
}

export async function updateWorker(updates) {
  await delay();

  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return null;
  }

  const payload = {};
  const allowedKeys = [
    "fullName",
    "email",
    "phone",
    "profileImage",
    "city",
    "primarySkill",
    "experience",
    "bio",
    "skills",
  ];

  Object.entries(updates).forEach(([key, value]) => {
    if (allowedKeys.includes(key) && value !== undefined) {
      payload[key] = value;
    }
  });

  let session = currentUser;

  if (Object.keys(payload).length) {
    const response = await apiPatch("/auth/me", payload);
    const user = response?.user || {};

    session = {
      ...currentUser,
      ...user,
      token: currentUser.token,
    };

    setCurrentUser(session);
    useAuthStore.setState({
      user: session,
      isAuthenticated: true,
      isLoading: false,
    });
  }

  const workerId =
    toNumericWorkerId(session.workerProfileId) || toNumericWorkerId(session.id);

  const updatedWorker = workerId ? await getWorkerById(workerId) : null;

  if (!updatedWorker) {
    return session;
  }

  return {
    ...updatedWorker,
    ...updates,
    profileImage: updatedWorker.profileImage || updates.profileImage || currentUser.profileImage,
    avatar: updatedWorker.profileImage || updates.profileImage || currentUser.profileImage,
  };
}

export async function updateWorkerProfileImage(profileImage) {
  await delay();

  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== "worker") {
    return null;
  }

  const response = await apiPatch("/auth/me", { profileImage });
  const user = response?.user || {};

  const updatedSession = {
    ...currentUser,
    ...user,
    token: currentUser.token,
  };

  setCurrentUser(updatedSession);
  useAuthStore.setState({
    user: updatedSession,
    isAuthenticated: true,
    isLoading: false,
  });

  return getCurrentWorker();
}

export async function getWorkerRequests() {
  await delay();

  const session = await refreshCurrentSession();

  if (!session || session.role !== "worker") {
    return [];
  }

  const response = await apiGet("/worker/requests");
  return (response?.requests || [])
    .map(normalizeRequest)
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getWorkerRequestDetails(requestId) {
  await delay();

  const numericRequestId = toNumericWorkerId(requestId);

  if (!numericRequestId) {
    return null;
  }

  const response = await apiGet(`/worker/requests/${numericRequestId}`);

  return {
    request: normalizeRequest(response?.request || response),
    customer: normalizeCustomer(response?.customer),
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

  const requestList = requests.map((request) => {
    const customer = request.customer || null;

    return {
      id: request.requestId,
      customer: customer?.fullName || "Customer",
      avatar: customer?.profileImage || "/api/placeholder/150/150",
      title: request.title,
      location: request.location || "Location not specified",
      date: formatRequestDate(request),
      budget: request.budget
        ? `ETB ${Number(request.budget).toLocaleString()}`
        : "Negotiable",
      status: request.status,
      statusLabel: formatRequestStatus(request.status),
      description: request.description || "No description provided.",
      request,
    };
  });

  return {
    worker,
    requests: requestList,
  };
}

export async function searchWorkers(query) {
  await delay();

  const workers = await getWorkers();

  if (!query.trim()) {
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

  const requests = await getWorkerRequests();

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((request) => request.status === "pending").length,
    acceptedRequests: requests.filter((request) => request.status === "accepted").length,
    inProgressRequests: requests.filter(
      (request) => request.status === "in_progress",
    ).length,
    completedRequests: requests.filter(
      (request) =>
        request.status === "completed" || request.status === "confirmed",
    ).length,
  };

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return {
    worker,
    stats,
    recentRequests,
  };
}

export async function getWorkerPortfolio(workerId) {
  return getPortfolioByWorker(workerId);
}

export async function getWorkerProfileData(workerId) {
  await delay();

  const worker = await getWorkerById(workerId);

  if (!worker) {
    return null;
  }

  const [portfolio, rating] = await Promise.all([
    getWorkerPortfolio(workerId),
    getWorkerRating(workerId),
  ]);

  return {
    worker,
    portfolio,
    rating,
  };
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
    (request) =>
      request.status === "completed" || request.status === "confirmed",
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
      title:
        worker.rating >= 4.8 ? "Top Rated Worker" : "Consistently Reliable",
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

  let worker = await getCurrentWorker();

  if (!worker) {
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "worker") {
      return null;
    }

    const workerId =
      toNumericWorkerId(currentUser.workerProfileId) ||
      toNumericWorkerId(currentUser.id);

    if (!workerId) {
      return null;
    }

    worker = await getWorkerById(workerId);
  }

  const [portfolio, rating] = await Promise.all([
    getWorkerPortfolio(worker.id),
    getWorkerRating(worker.id),
  ]);

  return {
    worker: {
      ...worker,
      rating: rating?.rating ?? 0,
      totalReviews: rating?.totalReviews ?? 0,
    },
    portfolio,
    stats: {
      portfolioCount: portfolio.length,
      rating: rating?.rating ?? 0,
      totalReviews: rating?.totalReviews ?? 0,
    },
  };
}
