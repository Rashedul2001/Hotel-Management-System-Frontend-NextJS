"use client";

import { redirect } from "next/navigation";
import { FaFacebook, FaGithub, FaLinkedin } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

type SocialProvider = "google" | "linkedin" | "github" | "facebook";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5052";

export function SocialAuthButtons() {
  const handleClick = (provider: SocialProvider) => () => {
    // IMPORTANT:
    // OAuth must start by navigating the browser to the backend.
    //
    // Do NOT use apiFetch() here.
    //
    // The backend must be allowed to redirect the browser to
    // Google/Facebook/LinkedIn/GitHub and then receive the
    // provider callback.
    // OAuth must start by navigating the browser to the backend
    // (not fetch/apiFetch), so it can redirect to the provider.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${apiUrl}/api/auth/external/${provider}`);
  };

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
  );
}
