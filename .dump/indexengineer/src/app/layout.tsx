import './globals.css';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ClientProvider } from '@/components/providers/ClientProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="container mx-auto p-4">
            <ClientProvider>
              {children}
            </ClientProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
