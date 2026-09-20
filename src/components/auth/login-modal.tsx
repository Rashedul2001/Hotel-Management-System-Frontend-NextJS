"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { FaHotel } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SocialAuthButtons } from "./social-auth-buttons";
import { apiFetch } from "@/lib/api";
import { errorToast, successToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/AuthContext";

export interface LoginFormValues {
  EmailOrUserName: string;
  Password: string;
  RememberMe: boolean;
}

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}

export function LoginModal({
  open,
  onOpenChange,
  onSwitchToRegister,
}: LoginModalProps) {
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onBlur",
    defaultValues: {
      EmailOrUserName: "",
      Password: "",
      RememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await apiFetch("/api/auth/login?useCookies=true", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        errorToast(
          data.message ?? "Invalid email or password.",
          "Please check your credentials and try again.",
        );
        return;
      }

      await refreshUser();

      successToast("Login successful.", "Welcome back to Velora.");
      onOpenChange(false);
      reset();
    } catch {
      errorToast(
        "Unable to connect to the server.",
        "Please try again in a moment.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
          setShowPassword(false);
        }
      }}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-md gap-0 overflow-hidden rounded-2xl border-border bg-background p-0 shadow-2xl sm:w-full">
        <div className="h-1.5 w-full bg-primary" />

        <div className="max-h-[90vh] overflow-y-auto p-5 sm:p-7">
          <DialogHeader className="mb-6 text-center">
            <div className="flex mx-auto mb-4 h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
              <span className=" hotel-display text-lg font-semibold">V</span>
            </div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Velora Hotels
            </p>

            <DialogTitle className="hotel-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Welcome back
            </DialogTitle>

            <DialogDescription className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Sign in to manage your reservations, stays, and personalized hotel
              experience.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="login-emailOrUserName">Email or username</Label>

              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="login-emailOrUserName"
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="username"
                  aria-invalid={!!errors.EmailOrUserName}
                  className="h-11 rounded-xl pl-10"
                  {...register("EmailOrUserName", {
                    required: "Enter your email or username.",
                  })}
                />
              </div>

              {errors.EmailOrUserName && (
                <p className="text-sm text-destructive">
                  {errors.EmailOrUserName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Password</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
                  onClick={() => {
                    // Connect this to your forgot-password flow.
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <FiLock
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />

                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.Password}
                  className="h-11 rounded-xl pl-10 pr-11"
                  {...register("Password", {
                    required: "Enter your password.",
                  })}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FiEyeOff className="size-4" />
                  ) : (
                    <FiEye className="size-4" />
                  )}
                </button>
              </div>

              {errors.Password && (
                <p className="text-sm text-destructive">
                  {errors.Password.message}
                </p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("RememberMe")}
              />
              Keep me signed in
            </label>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in…" : "Sign in to Velora"}
            </Button>
          </form>

          <SocialAuthButtons />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            New to Velora?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Create an account
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
