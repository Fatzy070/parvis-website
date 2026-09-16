const baseURL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export class ApiError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.status = status;
    Object.assign(this, details);
  }
}
export async function api(
  path,
  { method = "GET", body, signal, ...options } = {},
) {
  const multipart = body instanceof FormData;
  let response;
  try {
    response = await fetch(`${baseURL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(body !== undefined && !multipart
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(body !== undefined
        ? { body: multipart ? body : JSON.stringify(body) }
        : {}),
      signal,
      ...options,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(
      "Unable to connect. Check your connection and try again.",
      0,
    );
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new ApiError(
      payload?.error?.message ||
        "The request could not be completed. Please try again.",
      response.status,
      payload?.error,
    );
    if (response.status === 401 && !["/auth/login", "/auth/me"].includes(path))
      window.dispatchEvent(new Event("learnhub:session-expired"));
    throw error;
  }
  if (!payload || !("data" in payload))
    throw new ApiError(
      "The server returned an unexpected response. Please try again.",
      502,
    );
  return payload.data;
}
export const search = (params) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
  return query.size ? `?${query}` : "";
};
