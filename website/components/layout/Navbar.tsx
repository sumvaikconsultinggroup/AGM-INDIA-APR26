'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Heart } from 'lucide-react';
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
    isLive?: boolean;
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
    { name: t('live'), href: '/live', isLive: true },
    { name: t('gallery'), href: '/gallery' },
    { name: t('volunteer'), href: '/volunteer' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          isScrolled
            ? 'bg-maroon-gradient py-3 shadow-temple'
            : 'bg-spiritual-warmWhite/95 backdrop-blur-md py-4'
        )}
      >
        {/* Top Gold Accent Line - Temple arch inspired */}
        <div 
          className={cn(
            "absolute top-0 left-0 right-0 h-1 transition-opacity duration-500",
            isScrolled ? "opacity-0" : "opacity-100"
          )}
          style={{
            background: 'linear-gradient(90deg, transparent 5%, #D4A017 20%, #FF6B00 50%, #D4A017 80%, transparent 95%)'
          }}
        />

        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo with golden glow */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={cn(
                  "relative rounded-full transition-all duration-500",
                  isScrolled 
                    ? "shadow-[0_0_20px_rgba(212,160,23,0.4)]" 
                    : "shadow-glow"
                )}
              >
                <Image
                  src={isScrolled ? '/assets/Non Scroll Logo.svg' : '/assets/Avdheshanandg mission logo.png'}
                  alt="Avdheshanand Mission"
                  width={isScrolled ? 60 : 75}
                  height={isScrolled ? 60 : 75}
                  className="transition-all duration-500"
                  priority
                />
              </motion.div>
              {/* Brand Name */}
              <span 
                className={cn(
                  "hidden md:block font-display text-lg font-semibold transition-all duration-500",
                  isScrolled ? "text-gold-300" : "text-spiritual-maroon"
                )}
              >
                Avdheshanand<span className="text-gold-400">G</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => link.children && setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                  onFocus={() => link.children && setActiveDropdown(link.name)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                      setActiveDropdown(null);
                    }
                  }}
                >
                  {link.children ? (
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown(activeDropdown === link.name ? null : link.name)
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setActiveDropdown(null);
                        }
                      }}
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === link.name}
                      className={cn(
                        'relative px-4 py-2 font-medium transition-all duration-300 flex items-center gap-1 group bg-transparent',
                        isScrolled
                          ? 'text-gold-200 hover:text-gold-400'
                          : 'text-spiritual-maroon hover:text-spiritual-saffron'
                      )}
                    >
                      {link.name}
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        activeDropdown === link.name && "rotate-180"
                      )} />
                      <span
                        className={cn(
                          "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 w-0 group-hover:w-3/4",
                          isScrolled
                            ? "bg-gradient-to-r from-gold-400 via-primary-400 to-gold-400"
                            : "bg-gradient-to-r from-gold-400 via-spiritual-saffron to-gold-400"
                        )}
                      />
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        'relative px-4 py-2 font-medium transition-all duration-300 flex items-center gap-1 group',
                        isScrolled
                          ? 'text-gold-200 hover:text-gold-400'
                          : 'text-spiritual-maroon hover:text-spiritual-saffron'
                      )}
                    >
                      {link.name}
                      {link.isLive && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      )}
                      {/* Saffron-Gold gradient underline on hover */}
                      <span 
                        className={cn(
                          "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 w-0 group-hover:w-3/4",
                          isScrolled 
                            ? "bg-gradient-to-r from-gold-400 via-primary-400 to-gold-400"
                            : "bg-gradient-to-r from-gold-400 via-spiritual-saffron to-gold-400"
                        )}
                      />
                    </Link>
                  )}

                  {/* Dropdown with temple styling */}
                  <AnimatePresence>
                    {link.children && activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-52 rounded-xl overflow-hidden shadow-temple"
                        role="menu"
                        style={{
                          background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
                          border: '1px solid rgba(212, 160, 23, 0.3)'
                        }}
                      >
                        {/* Gold top accent */}
                        <div 
                          className="h-0.5"
                          style={{
                            background: 'linear-gradient(90deg, #D4A017, #FF6B00, #D4A017)'
                          }}
                        />
                        {link.children.map((child, idx) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            role="menuitem"
                            className={cn(
                              "block px-5 py-3 text-spiritual-maroon hover:text-spiritual-saffron hover:bg-gold-50/50 transition-all duration-300 font-medium",
                              idx !== link.children.length - 1 && "border-b border-gold-100/50"
                            )}
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {child.name}
                            </span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher isScrolled={isScrolled} />
              <Link
                href="/donate"
                className={cn(
                  "hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300",
                  isScrolled
                    ? "bg-gradient-to-r from-gold-400 to-gold-500 text-spiritual-maroon hover:shadow-[0_4px_20px_rgba(212,160,23,0.4)] hover:-translate-y-0.5"
                    : "btn-primary"
                )}
              >
                <Heart className="w-4 h-4" />
                {t('donate')}
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'lg:hidden p-2.5 rounded-full transition-all duration-300',
                  isScrolled 
                    ? 'text-gold-300 hover:text-gold-400 hover:bg-gold-400/10' 
                    : 'text-spiritual-maroon hover:text-spiritual-saffron hover:bg-gold-50'
                )}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-spiritual-maroon/60 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[320px] z-50 lg:hidden overflow-y-auto"
              style={{
                background: 'linear-gradient(180deg, #FFFDF5, #FFF8E7)',
                borderLeft: '3px solid #D4A017',
                boxShadow: '-10px 0 40px rgba(128, 0, 32, 0.3)'
              }}
            >
              {/* Header with gold accent */}
              <div 
                className="flex items-center justify-between p-5"
                style={{
                  borderBottom: '1px solid rgba(212, 160, 23, 0.3)',
                  background: 'linear-gradient(180deg, rgba(212, 160, 23, 0.1), transparent)'
                }}
              >
                <span className="font-display text-xl text-spiritual-maroon flex items-center gap-2">
                  <span className="text-gold-400">॥</span>
                  {t('menu')}
                  <span className="text-gold-400">॥</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gold-100/50 transition-colors text-spiritual-maroon"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <nav className="p-5 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {link.children ? (
                      <div className="space-y-1">
                        <span className="block px-4 py-3 font-display font-medium text-spiritual-maroon">
                          {link.name}
                        </span>
                        <div className="pl-4 space-y-0.5">
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block px-4 py-2.5 text-spiritual-warmGray hover:text-spiritual-saffron hover:bg-gold-50/50 rounded-lg transition-all duration-300"
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-3 font-display font-medium text-spiritual-maroon hover:text-spiritual-saffron hover:bg-gold-50/50 rounded-xl transition-all duration-300"
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Om Symbol Divider */}
                <div className="py-4 flex items-center justify-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                  <span className="text-gold-400 text-2xl font-sanskrit">ॐ</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                </div>

                {/* Language Switcher */}
                <div className="flex justify-center py-2">
                  <LanguageSwitcher />
                </div>

                {/* Donate Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2"
                >
                  <Link
                    href="/donate"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-gold w-full justify-center gap-2 rounded-xl py-4"
                  >
                    <Heart className="w-4 h-4" />
                    {t('donateWithLove')}
                  </Link>
                </motion.div>

                {/* Blessing text */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center text-spiritual-warmGray/60 text-sm pt-6 font-spiritual italic"
                >
                  &ldquo;सर्वे भवन्तु सुखिनः&rdquo;
                </motion.p>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
