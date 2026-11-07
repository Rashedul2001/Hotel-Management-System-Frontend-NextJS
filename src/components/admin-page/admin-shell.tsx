"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin-page/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="admin-mobile-header">
        <Link href="/" className="admin-mobile-header__brand" aria-label="Velora Hotels home">
          <span className="admin-mobile-header__logo">V</span>
          <span className="font-semibold">Velora</span>
        </Link>

        <Button
          className={cn(isSidebarOpen && "hidden")}
          type="button"
          variant="outline"
          size="icon"
          aria-label={isSidebarOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen((open) => !open)}
        >
          <Menu />
        </Button>
      </header>

      <main className="admin-shell">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <button
            type="button"
            className="admin-sidebar__overlay"
            aria-label="Close navigation"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <div className="admin-content">{children}</div>
      </main>
    </>
  );
}