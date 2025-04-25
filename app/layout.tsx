import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import '@/styles/components/layout.css';
import { FloatingElementsProvider } from '@/hooks/floating-elements';
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";

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
  metadataBase: new URL('https://cmu-qpa.pages.dev'),
  authors: [{ name: 'Miguel Salvacion' }],
  generator: 'Next.js',
  applicationName: 'CMU QPA Calculator',
  keywords: ['CMU', 'QPA', 'Calculator', 'Carnegie Mellon University', 'GPA'],
  openGraph: {
    title: 'CMU QPA Calculator',
    description: 'Calculate your QPA (Quality Point Average) for CMU courses.',
    url: 'https://cmu-qpa.pages.dev',
    siteName: 'CMU QPA Calculator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/android-chrome-192x192.png',
        width: 192,
        height: 192,
        alt: 'CMU QPA Calculator Logo',
      }
    ],
  },
  twitter: {
    title: 'CMU QPA Calculator',
    description: 'Calculate your QPA (Quality Point Average) for CMU courses.',
    card: 'summary',
    images: ['/android-chrome-192x192.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    shortcut: [{ url: '/favicon.ico' }],
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': '_moVArDPSJ04UvvM6ImLsYe0vs9WjuMlWi34_sv2XZw',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} root-body`}>
        <FloatingElementsProvider>
          {children}
          <Toaster />
        </FloatingElementsProvider>
      </body>
    </html>
  );
}
