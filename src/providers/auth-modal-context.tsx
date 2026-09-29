//don't know 

"use client"

import { RegisterModal } from "../components/auth/register-modal"
import { LoginModal } from "../components/auth/login-modal"
import { createContext, Suspense, useContext, useMemo, useState } from "react"
import { AuthErrorHandler } from "@/components/auth/auth-error-handler"

type AuthModalView = "login" | "register" | null

interface AuthModalContextValue {
    view: AuthModalView
    openLogin: () => void
    openRegister: () => void
    close: () => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(
    null
)

/**
 * Wrap your app (or just the header/layout) in this once. It renders both
 * modals and exposes the open/close/switch actions to everything inside it,
 * so a "Sign up" link in <LoginModal> can switch straight to <RegisterModal>
 * without any DOM id lookups.
 */
export function AuthModalProvider({ children }: { children: React.ReactNode }) {
    const [view, setView] = useState<AuthModalView>(null)

    const value = useMemo<AuthModalContextValue>(
        () => ({
            view,
            openLogin: () => setView("login"),
            openRegister: () => setView("register"),
            close: () => setView(null),
        }),
        [view]
    )

    return (
        <AuthModalContext.Provider value={value}>
            {children}
            <Suspense fallback={null}>
            <AuthErrorHandler/>
            </Suspense>

            <LoginModal
                open={view === "login"}
                onOpenChange={(open) => setView(open ? "login" : null)}
                onSwitchToRegister={value.openRegister}
            />
            <RegisterModal
                open={view === "register"}
                onOpenChange={(open) => setView(open ? "register" : null)}
                onSwitchToLogin={value.openLogin}
            />
        </AuthModalContext.Provider>
    )
}

export function useAuthModal() {
    const ctx = useContext(AuthModalContext)
    if (!ctx) {
        throw new Error("useAuthModal must be used within an AuthModalProvider")
    }
    return ctx
}