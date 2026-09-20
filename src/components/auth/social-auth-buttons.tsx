"use client"

import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa6"
import { FcGoogle } from "react-icons/fc"

export type SocialProvider = "google" | "linkedin" | "github" | "facebook"

interface SocialAuthButtonsProps {
    /**
     * Wire this callback to the real OAuth flow later.
     */
    onProviderClick?: (provider: SocialProvider) => void
}

export function SocialAuthButtons({
    onProviderClick,
}: SocialAuthButtonsProps) {
    const handleClick = (provider: SocialProvider) => () => {
        onProviderClick?.(provider)

        if (!onProviderClick) {
            console.log(`TODO: wire up ${provider} OAuth`)
        }
    }

    return (
        <div className="mt-6">
            <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    or continue with
                </span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <button
                type="button"
                onClick={handleClick("google")}
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <FcGoogle className="size-5" aria-hidden="true" />
                Continue with Google
            </button>

            <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={handleClick("linkedin")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
                    aria-label="Continue with LinkedIn"
                >
                    <FaLinkedin className="size-4 text-[#0A66C2]" aria-hidden="true" />
                    <span className="hidden sm:inline">LinkedIn</span>
                </button>

                <button
                    type="button"
                    onClick={handleClick("github")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
                    aria-label="Continue with GitHub"
                >
                    <FaGithub className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">GitHub</span>
                </button>

                <button
                    type="button"
                    onClick={handleClick("facebook")}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
                    aria-label="Continue with Facebook"
                >
                    <FaFacebook className="size-4 text-[#1877F2]" aria-hidden="true" />
                    <span className="hidden sm:inline">Facebook</span>
                </button>
            </div>
        </div>
    )
}
