"use client";

import React from "react";
import { SidebarProvider } from "./sidebar-context";
import { PMSSidebar } from "./pms-sidebar";
import { PMSTopbar } from "./pms-topbar";

export function PMSLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground antialiased">
        {/* Responsive PMS Sidebar (Desktop + Mobile off-canvas drawer) */}
        <PMSSidebar />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col min-w-0 min-h-screen">
          <PMSTopbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
