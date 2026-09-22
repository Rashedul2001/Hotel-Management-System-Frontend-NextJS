const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

export async function apiFetch(
    endpoint: string,
    options: RequestInit = {}
) {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: isFormData
            ? options.headers
            : {
                  "Content-Type": "application/json",
                  ...options.headers,
              },
    });
}