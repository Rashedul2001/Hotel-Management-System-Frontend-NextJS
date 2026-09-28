"use client"

import * as React from "react"

import { useAuth } from "@/providers/AuthContext"
import { useAuthModal } from "@/providers/auth-modal-context"

interface ProtectedContentProps {
    children: React.ReactNode
}

/**
 * Wrap the body of a protected page in this. It doesn't redirect — it keeps
 * the page mounted, blurs/hides the real content, and opens the login modal
 * on top of it. Once auth flips to "authenticated" (e.g. right
 * after a successful login), the real content is revealed automatically.
 */
export function ProtectedContent({ children }: ProtectedContentProps) {
    const { isLoading, isAuthenticated } = useAuth()
    const { openLogin, view } = useAuthModal()
    const hasPromptedRef = React.useRef(false)

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasPromptedRef.current) {
            hasPromptedRef.current = true
            openLogin()
        }
        if (isAuthenticated) {
            hasPromptedRef.current = false
        }
    }, [isLoading, isAuthenticated, openLogin])

    if (isLoading) {
        return (
            <div className="space-y-4 p-8 animate-pulse" aria-busy="true" aria-label="Checking sign-in status">
                <div className="bg-gray-800 rounded w-1/3 h-8" />
                <div className="bg-gray-800 rounded w-2/3 h-4" />
                <div className="bg-gray-800 rounded h-64" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <section className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center" aria-labelledby="protected-content-title">
                <h1 id="protected-content-title" className="text-xl font-semibold">Sign in required</h1>
                <p>Please sign in to view this page.</p>
                <div>
                    <button
                        type="button"
                        onClick={() => view !== "login" && openLogin()}
                        className="bg-primary hover:bg-primary/90 shadow-lg px-6 py-3 rounded-md font-medium text-primary-foreground"
                    >
                        Sign in
                    </button>
                </div>
            </section>
        )
    }

    return <>{children}</>
}