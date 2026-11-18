import Link from "next/link";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CatchAllProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function PMSCatchAllPage({ params }: CatchAllProps) {
  const { slug } = await params;
  const path = slug.join("/");
  const title = slug[slug.length - 1]
    ? slug[slug.length - 1]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Module";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs mb-6">
        <Construction className="size-7" />
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-3">
        <Sparkles className="size-3.5 text-primary" />
        Phase 01 Navigation Ready
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
        {title}
      </h1>

      <p className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded-md mb-4">
        Route: /pms/{path}
      </p>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-8">
        The navigation architecture, routing structure, responsive sidebar, and
        permission filters for this section are fully operational. Business
        logic and operational widgets for this module are scheduled for Phase 02.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/pms/dashboard"
          className={buttonVariants({ variant: "default" })}
        >
          <ArrowLeft className="mr-2 size-4" />
          Return to Dashboard
        </Link>
        <Link
          href="/pms/rooms"
          className={buttonVariants({ variant: "outline" })}
        >
          Open Room Management
        </Link>
      </div>
    </div>
  );
}
