import './globals.css';
import { NextAuthProvider } from './providers';
import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <Navbar />
          <div className="min-h-screen bg-zinc-900 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
