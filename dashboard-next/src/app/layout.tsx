import { Outfit } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'sonner'; // Add this import

import { AllowedServiceProvider } from '@/context/AllowedServiceContext';
import { I18nProvider } from '@/context/I18nContext';

const outfit = Outfit({
  variable: '--font-outfit-sans',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <AllowedServiceProvider>
          <I18nProvider>
            <ThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </I18nProvider>
          <Toaster position="top-right" /> {/* Add the Toaster here */}
        </AllowedServiceProvider>
      </body>
    </html>
  );
}
