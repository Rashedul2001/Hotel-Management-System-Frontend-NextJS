import type { Metadata } from "next";
import type { JSX } from "react";
import "../styles/globals.css";
import '../styles/notfound.css';
import { ThemeProvider } from "@/providers/theme-provider";


export const metadata: Metadata = {
    title: "Velora Hotels & Suites",
    description: "Welcome to Velora, where luxury meets comfort. Explore our exquisite rooms, indulge in world-class amenities, and experience unparalleled hospitality. Your perfect stay awaits.",
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

            <body >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >


                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}