'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export function Navbar() {
  const { t } = useTranslation('nav');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navLinks: Array<{
    name: string;
    href: string;
    children?: Array<{ name: string; href: string }>;
  }> = [
    { name: t('home'), href: '/' },
    { name: t('about'), href: '/about' },
    {
      name: t('wisdomLibrary'),
      href: '#',
      children: [
        { name: t('books'), href: '/books' },
        { name: t('podcasts'), href: '/podcasts' },
        { name: t('articles'), href: '/articles' },
        { name: t('videos'), href: '/videos' },
      ],
    },
    { name: t('schedule'), href: '/schedule' },
    { name: t('panchang'), href: '/panchang' },
    { name: t('live'), href: '/live' },
    { name: t('gallery'), href: '/gallery' },
    { name: t('volunteer'), href: '/volunteer' },
  ];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className={cn(
            'mx-auto flex max-w-7xl items-center justify-between rounded-[26px] border px-4 py-3 transition-all duration-300 sm:px-5',
            isScrolled
              ? 'border-[rgba(122,86,26,0.14)] bg-[rgba(255,252,247,0.92)] shadow-[0_18px_50px_rgba(37,23,11,0.12)] backdrop-blur-xl'
              : 'border-transparent bg-[rgba(255,252,247,0.72)] backdrop-blur-md'
          )}
        >
          <Link href="/" className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(122,86,26,0.12)] bg-white/80 shadow-[0_10px_25px_rgba(41,22,11,0.08)]">
              <Image
                src="/assets/Avdheshanandg mission logo.png"
                alt="Avdheshanand Mission"
                width={48}
                height={48}
                className="h-10 w-10 object-contain"
                priority
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="font-display text-lg leading-none text-spiritual-maroon">Avdheshanand Mission</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-spiritual-warmGray">Spiritual Platform</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.name}
                className="relative"
                onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.children ? (
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(activeDropdown === link.name ? null : link.name)}
                    className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-spiritual-maroon transition-colors hover:bg-[rgba(92,29,38,0.04)] hover:text-spiritual-saffron"
                  >
                    {link.name}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', activeDropdown === link.name && 'rotate-180')} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className="inline-flex rounded-full px-4 py-2 text-sm font-medium text-spiritual-maroon transition-colors hover:bg-[rgba(92,29,38,0.04)] hover:text-spiritual-saffron"
                  >
                    {link.name}
                  </Link>
                )}

                <AnimatePresence>
                  {link.children && activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full mt-3 w-56 rounded-[24px] border border-[rgba(122,86,26,0.16)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_22px_60px_rgba(41,22,11,0.18)] backdrop-blur-xl"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-spiritual-warmGray transition-colors hover:bg-[rgba(92,29,38,0.04)] hover:text-spiritual-maroon"
                        >
                          <span>{child.name}</span>
                          <ArrowRight className="h-4 w-4 text-spiritual-saffron" />
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher isScrolled={isScrolled} />
            <Link href="/donate" className="hidden sm:inline-flex btn-primary px-4 py-2.5">
              {t('donate')}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(122,86,26,0.14)] bg-white/80 text-spiritual-maroon lg:hidden"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[rgba(28,17,12,0.45)] backdrop-blur-sm lg:hidden"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-3 mt-24 rounded-[28px] border border-[rgba(122,86,26,0.16)] bg-[rgba(255,252,247,0.98)] p-4 shadow-[0_25px_60px_rgba(41,22,11,0.18)]"
            >
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link
                      href={link.children?.[0]?.href || link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-spiritual-maroon transition-colors hover:bg-[rgba(92,29,38,0.04)]"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-4 w-4 text-spiritual-saffron" />
                    </Link>
                    {link.children && (
                      <div className="ml-3 space-y-1 border-l border-[rgba(122,86,26,0.12)] pl-3">
                        {link.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-xl px-3 py-2 text-sm text-spiritual-warmGray transition-colors hover:bg-[rgba(92,29,38,0.04)] hover:text-spiritual-maroon"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Link
                href="/donate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-4 inline-flex w-full btn-primary justify-center"
              >
                {t('donate')}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
