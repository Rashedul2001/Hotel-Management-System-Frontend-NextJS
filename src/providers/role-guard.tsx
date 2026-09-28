"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthContext";
import { useAuthModal } from "@/providers/auth-modal-context";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: readonly string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { isLoading, isAuthenticated, hasAnyRole } = useAuth();
  const { openLogin, view } = useAuthModal();

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center p-6" aria-busy="true">
        <p role="status">Checking your access...</p>
      </main>
    );
  }

  const canAccess = isAuthenticated && hasAnyRole([...allowedRoles]);

  if (!canAccess) {
    const isSignedIn = isAuthenticated;

    return (
      <main className="grid min-h-screen place-items-center p-6">
        <section className="w-full max-w-md space-y-4 text-center" aria-labelledby="access-title">
          <h1 id="access-title" className="text-2xl font-semibold">
            {isSignedIn ? "Access denied" : "Sign in required"}
          </h1>
          <p>
            {isSignedIn
              ? "Your account does not have permission to view this page."
              : "Sign in with an administrator account to continue."}
          </p>
          {isSignedIn ? (
            <Link className="inline-flex rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground" href="/">
              Return to Velora
            </Link>
          ) : (
            <button
              type="button"
              className="rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground"
              onClick={() => view !== "login" && openLogin()}
            >
              Sign in
            </button>
          )}
        </section>
      </main>
    );
  }

  return children;
}