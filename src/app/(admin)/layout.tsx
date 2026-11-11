import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "../../styles/admin-global.css";
import { AdminShell } from "@/components/admin-page/admin-shell";
import { RoleGuard } from "@/providers/role-guard";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

// Primary UI Font
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Monospace font for data/numbers
export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velora-Admin",
  description: "A calm, powerful command center for Velora operations.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="admin"
      className={cn(
        "min-h-screen antialiased bg-background text-foreground",
        inter.variable,
        robotoMono.variable,
      )}
    >
      <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
        <AdminShell>{children}</AdminShell>
      </RoleGuard>
    </div>
  );
}
