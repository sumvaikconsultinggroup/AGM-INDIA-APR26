'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, MapPin, Phone, Mail, Youtube, Facebook, Instagram, Twitter, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const quickLinkKeys = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'schedule', href: '/schedule' },
  { key: 'books', href: '/books' },
  { key: 'videos', href: '/videos' },
  { key: 'volunteer', href: '/volunteer' },
];

const socialLinks = [
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@avdheshanandg' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/AvdheshanandG/' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/avdheshanandg_official/' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/AvdheshanandG' },
];

export function Footer() {
  const { t } = useTranslation('footer');
  const { t: tCommon } = useTranslation('common');
  const { t: tNav } = useTranslation('nav');

  return (
    <footer className="relative overflow-hidden">
      {/* Mandala pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(212, 160, 23, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(212, 160, 23, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(212, 160, 23, 0.08) 0%, transparent 60%)
          `
        }}
      />

      {/* Main Footer */}
      <div 
        className="relative pt-20 pb-8"
        style={{
          background: 'linear-gradient(180deg, #800020 0%, #4A0010 100%)'
        }}
      >
        {/* Decorative Top Border - Rangoli Pattern */}
        <div className="absolute top-0 left-0 right-0">
          <div 
            className="h-1"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4A017 20%, #FFD54F 50%, #D4A017 80%, transparent)'
            }}
          />
          <div className="flex justify-center -mt-4">
            <span className="bg-spiritual-maroon px-6 text-gold-400 text-2xl font-sanskrit">ॐ</span>
          </div>
        </div>

        <div className="container-custom pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <Link href="/" className="inline-block mb-6 group">
                <div className="relative">
                  <Image
                    src="/assets/Non Scroll Logo.svg"
                    alt="Avdheshanand Mission"
                    width={100}
                    height={100}
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Golden glow effect */}
                  <div className="absolute inset-0 rounded-full opacity-50 blur-xl bg-gold-400/20 group-hover:opacity-70 transition-opacity" />
                </div>
              </Link>
              <p className="text-gold-200/80 leading-relaxed mb-6 font-body">
                {t('tagline')}
              </p>
              
              {/* Social Links with ornamental frames */}
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full flex items-center justify-center text-gold-300 transition-all duration-300 hover:text-gold-400 hover:scale-110 hover:shadow-[0_0_20px_rgba(212,160,23,0.4)]"
                    style={{
                      border: '2px solid rgba(212, 160, 23, 0.4)',
                      background: 'rgba(212, 160, 23, 0.05)'
                    }}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-display text-xl text-gold-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-gold-400 to-transparent" />
                {t('quickLinks')}
              </h3>
              <ul className="space-y-3">
                {quickLinkKeys.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-gold-200/80 hover:text-primary-400 transition-colors inline-flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 opacity-50 group-hover:opacity-100 group-hover:bg-primary-400 transition-all" />
                      {tNav(link.key)}
                      <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-display text-xl text-gold-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-gold-400 to-transparent" />
                {t('contactUs')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border border-gold-400/30 bg-gold-400/5">
                    <MapPin className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="text-gold-200/80" style={{ whiteSpace: 'pre-line' }}>
                    {t('address')}
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gold-400/30 bg-gold-400/5">
                    <Phone className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="text-gold-200/80">{t('phone')}</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-gold-400/30 bg-gold-400/5">
                    <Mail className="w-4 h-4 text-gold-400" />
                  </div>
                  <span className="text-gold-200/80">{t('email')}</span>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-display text-xl text-gold-400 mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-gold-400 to-transparent" />
                {t('stayConnected')}
              </h3>
              <p className="text-gold-200/80 mb-4">
                {t('newsletterText')}
              </p>
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 text-gold-100 placeholder:text-gold-300/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold-400/50"
                  style={{
                    border: '2px solid rgba(212, 160, 23, 0.3)'
                  }}
                />
                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-spiritual-maroon transition-all duration-300 hover:shadow-[0_6px_25px_rgba(255,107,0,0.4)] hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00, #FFB300)'
                  }}
                >
                  {t('subscribeWithLove')}
                  <Heart className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>

          {/* Rangoli Divider */}
          <div className="relative py-6 flex items-center justify-center">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            <div className="relative flex items-center gap-3 px-6 bg-[#5a0015]">
              <span className="text-gold-400 text-sm">✦</span>
              <span className="text-gold-300/60 text-xs font-sanskrit">॥ हरि ॐ ॥</span>
              <span className="text-gold-400 text-sm">✦</span>
            </div>
          </div>

          {/* Sanskrit Blessing */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-6"
          >
            <p className="font-spiritual text-gold-300/80 text-lg italic mb-2">
              &ldquo;सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः&rdquo;
            </p>
            <p className="text-gold-200/50 text-sm">
              {tCommon('sarveBlessing')}
            </p>
          </motion.div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gold-400/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gold-300/60 text-sm">
                © {new Date().getFullYear()} {tCommon('copyright')}{' '}
                <Heart className="w-4 h-4 inline text-primary-400" /> {tCommon('forSpiritualSeekers')}
              </p>
              <div className="flex gap-6 text-sm">
                <Link href="/privacy" className="text-gold-300/60 hover:text-primary-400 transition-colors">
                  {tCommon('privacyPolicy')}
                </Link>
                <Link href="/terms" className="text-gold-300/60 hover:text-primary-400 transition-colors">
                  {tCommon('termsOfService')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Diya icon at bottom corners */}
        <div className="absolute bottom-4 left-8 text-gold-400/20 text-3xl hidden lg:block">🪔</div>
        <div className="absolute bottom-4 right-8 text-gold-400/20 text-3xl hidden lg:block">🪔</div>
      </div>
    </footer>
  );
}
