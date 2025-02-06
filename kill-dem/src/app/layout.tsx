import {
  ClerkProvider
} from '@clerk/nextjs'
import { ThemeProvider } from "next-themes"
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBDP-SIMS",
  description: "Personal Performance Optimization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem> {/* change the defaultTheme vlaue to system once you have figured out how to proplerly implement dark mode everywhere.*/}
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
