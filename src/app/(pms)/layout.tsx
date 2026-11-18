import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "../../styles/admin-global.css";
import { RoleGuard } from "@/providers/role-guard";
import { PermissionProvider } from "@/lib/permissions/permission-context";
import { PMSLayout } from "@/components/pms/pms-layout";
import { ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hotel Velora - PMS",
  description: "Enterprise Property Management System for Hotel Velora.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function InternalPMSLayout({
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
        robotoMono.variable
      )}
    >
      <RoleGuard
        allowedRoles={[
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN,
          ROLES.STAFF,
          ROLES.USER,
        ]}
      >
        <PermissionProvider>
          <PMSLayout>{children}</PMSLayout>
        </PermissionProvider>
      </RoleGuard>
    </div>
  );
}
