import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    default: 'PollsIA - DeFi Polls Platform',
    template: '%s | PollsIA'
  },
  description: 'Plataforma DeFi para criação e participação em enquetes descentralizadas com recompensas em tokens na blockchain Solana.',
  keywords: ['DeFi', 'Solana', 'Polls', 'Blockchain', 'Cryptocurrency', 'Enquetes', 'Tokens'],
  authors: [{ name: 'PollsIA Team' }],
  creator: 'PollsIA',
  publisher: 'PollsIA',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'PollsIA',
    title: 'PollsIA - DeFi Polls Platform',
    description: 'Plataforma DeFi para criação e participação em enquetes descentralizadas com recompensas em tokens na blockchain Solana.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PollsIA - DeFi Polls Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PollsIA - DeFi Polls Platform',
    description: 'Plataforma DeFi para criação e participação em enquetes descentralizadas com recompensas em tokens na blockchain Solana.',
    images: ['/og-image.png'],
    creator: '@pollsia',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}