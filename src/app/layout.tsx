import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Termyx - Gerador de Documentos Profissionais',
    template: '%s | Termyx'
  },
  description: 'Crie contratos, recibos e documentos profissionais em minutos. Simples, rapido e confiavel.',
  keywords: ['gerador de contratos', 'documentos', 'recibos', 'orcamentos', 'MEI', 'autonomo', 'PDF', 'termo de servico', 'declaracao'],
  authors: [{ name: 'Termyx' }],
  creator: 'Termyx',
  publisher: 'Termyx',
  metadataBase: new URL('https://termyx.com.br'),
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://termyx.com.br',
    siteName: 'Termyx',
    title: 'Termyx - Gerador de Documentos Profissionais',
    description: 'Crie contratos, recibos e documentos profissionais em minutos.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Termyx - Gerador de Documentos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Termyx - Gerador de Documentos Profissionais',
    description: 'Crie contratos, recibos e documentos profissionais em minutos.',
    images: ['/og-image.png'],
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
  category: 'technology',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Termyx',
  },
  applicationName: 'Termyx',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
