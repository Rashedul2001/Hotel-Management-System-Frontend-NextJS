import Link from "next/link";
import {
  BedDouble,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function PMSDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-linear-to-br from-card via-card to-accent/20 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Phase 01 — Layout & Navigation Architecture Complete
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Hotel Velora PMS Command Center
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to the internal property management system foundation. The responsive
            sidebar, nested navigation hierarchy, topbar, theme switcher, and
            permission filtering engine are fully operational. Business modules and
            analytics will be integrated in subsequent phases.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/pms/rooms"
              className={buttonVariants({ variant: "default" })}
            >
              <BedDouble className="mr-2 size-4" />
              Explore Room Management
            </Link>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">
            Centralized Navigation
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All 7 departments, 18 primary domains, and 90+ operational submenus are
            strongly typed with Lucide icons and permissions.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">
            Permission-Aware Filtering
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatic filtering ensures SuperAdmin, Admin, and Staff members see
            only the authorized sections and operations for their roles.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">
            Phase 02 Readiness
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Each section link points to canonical PMS endpoints ready for business
            logic, APIs, and data table components.
          </p>
        </div>
      </div>
    </div>
  );
}
