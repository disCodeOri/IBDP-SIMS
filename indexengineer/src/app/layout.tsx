import type { Metadata } from "next";
import "./globals.css";
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
      <body className={`antialiased bg-gray-100 min-h-screen text-gray-900`}>
          <main className="container mx-auto p-4">
            {children}
          </main>
      </body>
    </html>
  );
}
