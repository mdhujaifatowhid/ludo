import type { Metadata } from 'next';
import { Baloo_2, Inter } from 'next/font/google';
import './globals.css';

const display = Baloo_2({ subsets: ['latin'], variable: '--font-display', weight: ['500', '600', '700', '800'] });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'Ludo Realtime — play with friends anywhere',
  description: 'A cozy, real-time multiplayer Ludo table for 2-4 players.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-body bg-felt-dark text-cream min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
