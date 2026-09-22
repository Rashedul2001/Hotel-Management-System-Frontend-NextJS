//don't know 

export interface SessionUser {
    id: string
    email: string
}

export interface SessionResult {
    authenticated: boolean
    user: SessionUser | null
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL // e.g. https://api.yourhotel.com

/**
 * Asks the ASP.NET Core API whether the current visitor is logged in.
 * This is the ONE function to finish once you've picked cookie vs JWT —
 * everything else in this folder (SessionProvider, ProtectedContent,
 * requireAuth) is agnostic to that choice and won't need to change.
 *
 * Option A — httpOnly cookie / ASP.NET Core Identity cookie auth:
 *   fetch(`${API_BASE_URL}/account/me`, { credentials: "include" })
 *   Your API's CORS policy must allow this exact origin (not "*") and set
 *   Access-Control-Allow-Credentials: true, or the browser drops the cookie.
 *
 * Option B — JWT you store yourself (e.g. in memory via this same module):
 *   fetch(`${API_BASE_URL}/account/me`, {
 *     headers: { Authorization: `Bearer ${getStoredToken()}` },
 *   })
 */
export async function fetchSession(): Promise<SessionResult> {
    try {
        const response = await fetch(`${API_BASE_URL}/account/me`, {
            credentials: "include", // TODO: confirm once cookie vs JWT is decided
        })

        if (!response.ok) {
            return { authenticated: false, user: null }
        }

        const user: SessionUser = await response.json()
        return { authenticated: true, user }
    } catch {
        return { authenticated: false, user: null }
    }
}