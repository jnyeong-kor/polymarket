import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API-X Autonomous Agent Dashboard',
  description: 'Autonomous predictive intelligence dashboard for Polymarket operations.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
