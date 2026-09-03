const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";
const CURRENT_USER_KEY = "workconnect-current-user";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;
}

function getStoredCurrentUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(CURRENT_USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const currentUser = getStoredCurrentUser();
  const token = currentUser?.token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

function buildUrl(path, query) {
  const url = new URL(path.replace(/^\//, ""), `${getApiBaseUrl().replace(/\/$/, "")}/`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  return text ? { message: text } : null;
}

function getErrorMessage(payload, fallback) {
  return (
    payload?.error?.message ||
    payload?.message ||
    payload?.error ||
    fallback ||
    "Request failed."
  );
}

export async function apiRequest(path, { method = "GET", body, query, auth = true } = {}) {
  const headers = {
    Accept: "application/json",
    ...(auth ? getAuthHeaders() : {}),
  };

  const requestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, query), requestInit);
  const payload = await parseResponse(response);

  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event("workconnect-auth-expired"));
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.statusText));
  }

  return payload?.data ?? payload;
}

export function apiGet(path, options = {}) {
  return apiRequest(path, { ...options, method: "GET" });
}

export function apiPost(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "POST", body });
}

export function apiPatch(path, body, options = {}) {
  return apiRequest(path, { ...options, method: "PATCH", body });
}

export function apiDelete(path, options = {}) {
  return apiRequest(path, { ...options, method: "DELETE" });
}

export function readCurrentUserToken() {
  return getStoredCurrentUser()?.token || null;
}
