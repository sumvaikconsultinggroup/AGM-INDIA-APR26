import type { Metadata } from 'next';
import { Inter, Playfair_Display, Cormorant_Garamond, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/ui/PageTransition';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { I18nProvider } from '@/components/providers/I18nProvider';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-cormorant',
  display: 'swap',
});

const notoSerif = Noto_Serif_Devanagari({ 
  subsets: ['devanagari'], 
  weight: ['400', '500', '600', '700'], 
  variable: '--font-noto-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Swami Avdheshanand Giri Ji Maharaj | Spiritual Guide & Visionary',
  description: 'Experience the divine wisdom of Swami Avdheshanand Giri Ji Maharaj, Acharya Mahamandaleshwar & Juna Akhada\'s Peethadheeshwar, guiding souls to inner awakening.',
  keywords: 'Swami Avdheshanand Giri, Juna Akhada, spiritual leader, Advait Vedanta, Hinduism, meditation, ashram, guru, spirituality',
  openGraph: {
    title: 'Swami Avdheshanand Giri Ji Maharaj',
    description: 'Experience the divine wisdom of Swami Avdheshanand Giri Ji Maharaj',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable} ${cormorant.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen bg-spiritual-warmWhite overflow-x-hidden font-body text-spiritual-warmGray">
        <I18nProvider>
          <ScrollProgress />
          <Navbar />
          <PageTransition>
            <main className="flex-1">
              {children}
            </main>
          </PageTransition>
          <Footer />
          <WhatsAppButton />
          <ChatWidget />
        </I18nProvider>
      </body>
    </html>
  );
}
