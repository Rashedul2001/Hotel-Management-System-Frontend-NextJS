"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { errorToast } from "@/components/ui/toast";
import { useAuthModal } from "@/providers/auth-modal-context";

const MAX_MESSAGE_LENGTH = 200;

/**
 * Handles the redirect from the backend after a failed social sign-in
 * (e.g. /?authError=...). Shows the message, opens the login modal,
 * then removes the parameter so a refresh doesn't repeat it.
 */
export function AuthErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openLogin } = useAuthModal();

  const handledRef = React.useRef(false);

  React.useEffect(() => {
    const authError = searchParams.get("authError");

    if (!authError || handledRef.current) {
      return;
    }

    handledRef.current = true;

    errorToast(
      authError.slice(0, MAX_MESSAGE_LENGTH),
      "Please try again or use a different sign-in method.",
    );

    openLogin();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("authError");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [searchParams, pathname, router, openLogin]);

  return null;
}
