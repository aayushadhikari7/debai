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
          <div className="pt-16">
            {children}
          </div>
        </NextAuthProvider>
      </body>
    </html>
  );
}
