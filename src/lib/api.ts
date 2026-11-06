const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
) {
  const isFormData =
    (typeof FormData !== "undefined" && options.body instanceof FormData) ||
    Boolean(
      options.body &&
        typeof options.body === "object" &&
        typeof (options.body as FormData).append === "function",
    );

  const headers = new Headers(options.headers);

  if (isFormData) {
    // IMPORTANT: For multipart/form-data, NEVER set or keep the Content-Type header.
    // Fetch automatically generates multipart/form-data WITH the cryptographic boundary string.
    headers.delete("Content-Type");
    headers.delete("content-type");
  } else if (
    !headers.has("Content-Type") &&
    options.body &&
    typeof options.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });
}
