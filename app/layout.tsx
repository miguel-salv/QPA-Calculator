import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { FloatingElementsProvider } from '@/hooks/floating-elements';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CMU QPA Calculator',
  description: 'Calculate your QPA (Quality Point Average) for CMU courses.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden h-screen fixed w-full`}>
        <FloatingElementsProvider>
          {children}
          <Toaster />
        </FloatingElementsProvider>
      </body>
    </html>
  );
}
