import type { Metadata } from "next";
import type { JSX } from "react";
import { Inter, Roboto_Mono } from 'next/font/google';
import "../../styles/admin-global.css"
import { AdminShell } from "@/components/admin-page/admin-shell";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/providers/AuthContext";
import { AuthModalProvider } from "@/providers/auth-modal-context";
import { RoleGuard } from "@/providers/role-guard";
import { ROLES } from "@/lib/roles";
import { NuqsAdapter } from "nuqs/adapters/next/app";

// Primary UI Font
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Monospace font for data/numbers
export const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Velora-Admin",
  description: "A calm, powerful command center for Velora operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning={true} className={`${inter.variable} ${robotoMono.variable} antialiased `}>
      <head>
        <title>Velora-Admin</title>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>

            <AuthModalProvider>
              <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                <NuqsAdapter>
                  <AdminShell>{children}</AdminShell>
                </NuqsAdapter>
              </RoleGuard>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}