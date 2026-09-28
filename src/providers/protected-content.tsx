"use client"

import * as React from "react"

import { useAuth } from "@/providers/AuthContext"
import { useAuthModal } from "@/providers/auth-modal-context"

interface ProtectedContentProps {
    children: React.ReactNode
    /** Optional: shown instead of a blurred silhouette while unauthenticated. */
    fallback?: React.ReactNode
}

/**
 * Wrap the body of a protected page in this. It doesn't redirect — it keeps
 * the page mounted, blurs/hides the real content, and opens the login modal
 * on top of it. Once auth flips to "authenticated" (e.g. right
 * after a successful login), the real content is revealed automatically.
 */
export function ProtectedContent({ children, fallback }: ProtectedContentProps) {
        const { isLoading, isAuthenticated } = useAuth()
    const { openLogin, view } = useAuthModal()
    const hasPromptedRef = React.useRef(false)
        const status = isLoading
                ? "loading"
                : isAuthenticated
                    ? "authenticated"
                    : "unauthenticated"

    React.useEffect(() => {
        if (status === "unauthenticated" && !hasPromptedRef.current) {
            hasPromptedRef.current = true
            openLogin()
        }
        if (status === "authenticated") {
            hasPromptedRef.current = false
        }
    }, [status, openLogin])

    if (status === "loading") {
        return (
            <div className="space-y-4 p-8 animate-pulse" aria-hidden="true">
                <div className="bg-gray-800 rounded w-1/3 h-8" />
                <div className="bg-gray-800 rounded w-2/3 h-4" />
                <div className="bg-gray-800 rounded h-64" />
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <div className="relative">
                <div
                    className="blur-sm pointer-events-none select-none"
                    aria-hidden="true"
                >
                    {fallback ?? children}
                </div>

                {/* Covers the blurred content and lets someone re-open the modal
            if they dismissed it manually instead of logging in. */}
                <div className="absolute inset-0 flex justify-center items-center bg-background/40">
                    <button
                        type="button"
                        onClick={() => {
                            if (view !== "login") openLogin()
                        }}
                        className="bg-primary hover:bg-primary/90 shadow-lg px-6 py-3 rounded-md font-medium text-primary-foreground"
                    >
                        Sign in to view this page
                    </button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}