"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
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
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { errorToast, successToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/providers/AuthContext";

export interface RegisterFormValues {
  FullName: string;
  Email: string;
  Password: string;
  ConfirmPassword: string;
  AcceptTerms: boolean;
}

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}

export function RegisterModal({
  open,
  onOpenChange,
  onSwitchToLogin,
}: RegisterModalProps) {
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    mode: "onBlur",
    defaultValues: {
      FullName: "",
      Email: "",
      Password: "",
      ConfirmPassword: "",
      AcceptTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        errorToast(
          data.message ?? "Registration failed.",
          "Please check your details and try again.",
        );
        return;
      }

      await refreshUser();

      successToast(
        data.message ?? "Registration successful.",
        "Welcome to Velora.",
      );

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
          setShowConfirmPassword(false);
        }
      }}
    >
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-hidden rounded-2xl border-border bg-background p-0 shadow-2xl sm:w-full">
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
              Create your account
            </DialogTitle>

            <DialogDescription className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Join Velora to make reservations, manage your stays, and enjoy a
              smoother hotel experience.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="register-fullName">Full name</Label>

              <div className="relative">
                <FiUser
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="register-fullName"
                  type="text"
                  placeholder="Your full name"
                  autoComplete="name"
                  aria-invalid={!!errors.FullName}
                  className="h-11 rounded-xl pl-10"
                  {...register("FullName", {
                    required: "Enter your name.",
                  })}
                />
              </div>

              {errors.FullName && (
                <p className="text-sm text-destructive">
                  {errors.FullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>

              <div className="relative">
                <FiMail
                  className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.Email}
                  className="h-11 rounded-xl pl-10"
                  {...register("Email", {
                    required: "Enter your email.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
              </div>

              {errors.Email && (
                <p className="text-sm text-destructive">
                  {errors.Email.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>

                <div className="relative">
                  <FiLock
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    aria-invalid={!!errors.Password}
                    className="h-11 rounded-xl pl-10 pr-11"
                    {...register("Password", {
                      required: "Enter a password.",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters.",
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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

              <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">
                  Confirm password
                </Label>

                <div className="relative">
                  <FiLock
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="register-confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.ConfirmPassword}
                    className="h-11 rounded-xl pl-10 pr-11"
                    {...register("ConfirmPassword", {
                      required: "Confirm your password.",
                      validate: (value) =>
                        value === watch("Password") || "Passwords don't match.",
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="size-4" />
                    ) : (
                      <FiEye className="size-4" />
                    )}
                  </button>
                </div>

                {errors.ConfirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.ConfirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-3.5">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 rounded border-input accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-invalid={!!errors.AcceptTerms}
                  {...register("AcceptTerms", {
                    required: "You must accept the terms to continue.",
                  })}
                />

                <span className="leading-5">
                  I agree to Velora&apos;s{" "}
                  <a
                    href="#"
                    className="font-medium text-primary hover:underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="font-medium text-primary hover:underline"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {errors.AcceptTerms && (
                <p className="mt-2 text-sm text-destructive">
                  {errors.AcceptTerms.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-11 w-full rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creating your account…"
                : "Create Velora account"}
            </Button>
          </form>

          <SocialAuthButtons />

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already a Velora guest?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Sign in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
