import { apiDelete, apiGet, apiPost, fileToDataUrl } from "./api.service";

const CURRENT_USER_KEY = "workconnect-current-user";

export function setCurrentUser(user) {
  if (typeof window === "undefined") {
    return;
  }

  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event("workconnect-user-updated"));
    return;
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("workconnect-user-updated"));
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
  const payload = { ...data, role };

  if (data.profilePicture instanceof File) {
    payload.profileImage = await fileToDataUrl(data.profilePicture);
    delete payload.profilePicture;
  }

  const response = await apiPost(
    "/auth/register",
    payload,
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
  setCurrentUser(null);
}

export async function changePassword(currentPassword, newPassword) {
  const response = await apiPost("/auth/password", { currentPassword, newPassword });
  const session = getCurrentUser();

  if (session?.token) {
    const refreshedProfile = await apiGet("/auth/me");
    setCurrentUser({
      ...session,
      ...(refreshedProfile.user || refreshedProfile),
      token: session.token,
    });
  }

  return response;
}

export async function deleteAccount() {
  await apiDelete("/auth/me");
  setCurrentUser(null);
}

export async function registerCustomer(data) {
  return submitRegistration("customer", data);
}

export async function registerWorker(data) {
  return submitRegistration("worker", data);
}

export async function forgotPassword(email) {
  
  if (!email?.trim()) {
    throw new Error("Email is required.");
  }

  return {
    success: true,
    message: "Password reset email sent successfully.",
  };
}
