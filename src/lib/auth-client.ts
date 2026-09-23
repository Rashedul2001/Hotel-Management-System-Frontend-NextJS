import { apiFetch } from "@/lib/api"

export interface SessionUser {
    id: string
    email: string
}

export interface SessionResult {
    authenticated: boolean
    user: SessionUser | null
}

/** Ask the API whether the current visitor is logged in. */
export async function fetchSession(): Promise<SessionResult> {
    try {
        const response = await apiFetch("/api/auth/me")

        if (!response.ok) {
            return { authenticated: false, user: null }
        }

        const user: SessionUser = await response.json()
        return { authenticated: true, user }
    } catch {
        return { authenticated: false, user: null }
    }
}