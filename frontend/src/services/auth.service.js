import { delay } from "@/lib/delay";

import { apiPost } from "./api.service";

const CURRENT_USER_KEY = "workconnect-current-user";

export function setCurrentUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = localStorage.getItem(CURRENT_USER_KEY);

  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  return !!getCurrentUser()?.token;
}

function normalizeSession(data) {
  if (!data) {
    return null;
  }

  if (data.user) {
    return {
      ...data.user,
      token: data.token,
      workerProfileId: data.workerProfileId ?? data.user.workerProfileId ?? null,
    };
  }

  return {
    ...data,
    token: data.token,
  };
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
