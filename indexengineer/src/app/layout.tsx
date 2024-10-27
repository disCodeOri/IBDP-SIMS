import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CommandProvider } from "@/components/CommandProvider";
import { AuthCheck } from "@/components/AuthCheck";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Scheduler App",
  description: "A simple scheduler application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen text-gray-900`}>
        <CommandProvider>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </CommandProvider>
      </body>
    </html>
  );
}
