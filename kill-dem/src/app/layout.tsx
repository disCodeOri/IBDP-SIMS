import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Personal Performance Optimization Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .rst__lineHalfHorizontalRight::before,
          .rst__lineFullVertical::after,
          .rst__lineHalfVerticalTop::after,
          .rst__lineHalfVerticalBottom::after {
            background-color: #CBD5E0;
          }
        `}</style>
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

