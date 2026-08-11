import { delay } from "@/lib/delay";

import { apiPost } from "./api.service";

const CURRENT_USER_KEY = "workconnect-current-user";
const PLACEHOLDER_AVATAR = "/api/placeholder/150/150";

function normalizeStoredUser(user) {
  if (!user) {
    return null;
  }

  const role = String(user.role || user.Role || "").trim().toLowerCase();

  return {
    ...user,
    role,
    profileImage:
      user.profileImage || user.profile_image || user.avatar || PLACEHOLDER_AVATAR,
    workerProfileId:
      user.workerProfileId ?? user.worker_profile_id ?? user.workerProfileId ?? null,
  };
}

export function setCurrentUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    // notify any listeners (AuthProvider) so global auth store can sync
    try {
      window.dispatchEvent(new CustomEvent("workconnect:authChanged", { detail: null }));
    } catch (e) {
      // ignore
    }
    return;
  }

  // ensure a profileImage exists for UI consistency
  const normalized = normalizeStoredUser(user);

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalized));
  // notify any listeners (AuthProvider) so global auth store can sync
  try {
    window.dispatchEvent(new CustomEvent("workconnect:authChanged", { detail: normalized }));
  } catch (e) {
    // ignore
  }
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem(CURRENT_USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return normalizeStoredUser(JSON.parse(user));
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getCurrentUser()?.token;
}

function normalizeSession(data) {
  if (!data) {
    return null;
  }

  const source = data.user || data;

  const normalized = {
    // ids
    id: source.id ?? source.userId ?? source.user_id ?? null,

    // name fields
    fullName: source.fullName || source.full_name || source.name || "",

    // contact
    email: source.email || "",
    phone: source.phone || source.phone_number || "",

    // role
    role: String(source.role || source.Role || "").trim().toLowerCase(),

    // profile image: accept camelCase or snake_case or avatar
    profileImage:
      source.profileImage || source.profile_image || source.avatar || null,

    // timestamps
    createdAt: source.createdAt || source.created_at || null,
    updatedAt: source.updatedAt || source.updated_at || null,

    // worker profile id
    workerProfileId:
      data.workerProfileId ?? source.workerProfileId ?? source.worker_profile_id ?? null,

    // token
    token: data.token || source.token || null,
  };

  return normalized;
}

async function submitRegistration(role, data) {
  const response = await apiPost(
    "/auth/register",
    {
      ...data,
      role,
    },
    { auth: false },
  );

  const session = normalizeSession(response);

  setCurrentUser(session);

  return session;
}

export async function login(email, password) {
  const response = await apiPost(
    "/auth/login",
    {
      email,
      password,
    },
    { auth: false },
  );

  const session = normalizeSession(response);

  setCurrentUser(session);

  return session;
}

export async function logout() {
  await delay();
  setCurrentUser(null);
}

export async function registerCustomer(data) {
  return submitRegistration("customer", data);
}

export async function registerWorker(data) {
  return submitRegistration("worker", data);
}

export async function forgotPassword(email) {
  await delay();

  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  return {
    success: true,
    message: "Password reset email sent successfully.",
  };
}
