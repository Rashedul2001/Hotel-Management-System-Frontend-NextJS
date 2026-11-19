"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  FileCheck,
  Users,
  Eye,
  Server,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccessControlPoliciesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lock className="w-7 h-7 text-primary" />
            Access Control & Security Policies
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hotel Velora PMS authorization architecture, Role-Based Access Control (RBAC), and session security standards.
          </p>
        </div>

        <Link href="/pms/users/permissions">
          <Button size="sm" className="gap-2">
            <ShieldCheck className="w-4 h-4" />
            Configure Live Permissions
          </Button>
        </Link>
      </div>

      {/* Security Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground text-base">Role-Based Access Control (RBAC)</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every administrative capability is tied to an explicit permission key (e.g., <code>reservations.checkin</code>, <code>billing.refund</code>). Users acquire capabilities solely through assigned roles.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground text-base">Principle of Least Privilege</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Staff and department operators are granted only the minimum permissions required for their daily operational duties, eliminating inadvertent data alteration or unauthorized financial actions.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-foreground text-base">Hierarchical Protection</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Core system roles (SuperAdmin, Admin, Staff, Guest) are protected against renaming or accidental deletion. SuperAdmin deletion requires secondary account verification.
          </p>
        </div>
      </div>

      {/* Detailed Policy Specifications */}
      <div className="rounded-2xl bg-card border border-border shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            1. Authentication & Credential Standards
          </h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Password Complexity</span>
              Minimum 6 characters, requiring upper/lowercase combinations and symbols for high-privilege roles.
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border">
              <span className="font-semibold text-foreground block mb-1">Brute-Force Lockout</span>
              Accounts are automatically locked out for security review after successive failed login attempts.
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            2. Department Isolation & Folio Authority
          </h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Front desk staff are restricted from modifying back-office general ledger entries or initiating vendor payments. Cashier shift drawers require distinct verification at the start and end of every shift.
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            3. Audit Trail Logging
          </h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            All check-in, check-out, room transfer, and financial settlement actions log the operator identity, timestamp, and IP address for full accountability.
          </p>
        </div>
      </div>
    </div>
  );
}
