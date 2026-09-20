const BASE_URL = import.meta.env.VITE_API_URL;

export function getToken() {
  return localStorage.getItem("admin_access_token");
}

export function setToken(token: string) {
  localStorage.setItem("admin_access_token", token);
}

export function getRefreshToken() {
  return localStorage.getItem("admin_refresh_token");
}

export function setRefreshToken(token: string) {
  localStorage.setItem("admin_refresh_token", token);
}

export function clearToken() {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin_refresh_token");
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    setToken(data.access);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiFetch<T>(path, options, true);
    }
    // Refresh failed too — session is truly dead, force logout
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}