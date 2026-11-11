import type { Metadata } from "next";
import type { JSX } from "react";
import "../styles/globals.css";
import "../styles/notfound.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Velora Hotels & Suites",
  description:
    "Welcome to Velora, where luxury meets comfort. Explore our exquisite rooms, indulge in world-class amenities, and experience unparalleled hospitality. Your perfect stay awaits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <head>
        <title>Velora-Hotels & Suites</title>
        <link rel="icon" href="/favicon.png" />
      </head>

      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          {/* custom sonner toast style and color */}
          <Toaster
            position="bottom-right"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "w-full flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg font-sans text-sm",
                success:
                  "bg-emerald-500/40 border-emerald-500/50 text-emerald-600",
                error: "bg-rose-500/30 border-rose-500/50 text-rose-700",
                info: "bg-blue-500/40 border-blue-500/50 text-blue-600",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
