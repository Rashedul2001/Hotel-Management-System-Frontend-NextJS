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
import { Toaster } from "sonner";

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
    <html lang="en" suppressHydrationWarning = {true} className={`${inter.variable} ${robotoMono.variable} antialiased `}>
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
                <AdminShell>{children}</AdminShell>
              </RoleGuard>
            </AuthModalProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'w-full flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg font-sans text-sm',
              success: 'bg-emerald-500/40 border-emerald-500/50 text-emerald-600',
              error: 'bg-rose-500/30 border-rose-500/50 text-rose-700',
              info: 'bg-blue-500/40 border-blue-500/50 text-blue-600',
            }
          }}
        />

      </body>

    </html>
  );
}