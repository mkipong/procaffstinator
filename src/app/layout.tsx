import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProCaffstinator - Procrastinate Productively',
  description: "Procrastinate productively. Manage your tasks while pretending you're not procrastinating.",
  icons: {
    icon: '/branding/ProCaffstinator/13.0.png',
    shortcut: '/branding/ProCaffstinator/13.0.png',
    apple: '/branding/ProCaffstinator/13.0.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
