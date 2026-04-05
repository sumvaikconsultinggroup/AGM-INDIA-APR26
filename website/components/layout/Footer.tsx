'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const socialLinks = [
  { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@avdheshanandg' },
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/AvdheshanandG/' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/avdheshanandg_official/' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/AvdheshanandG' },
];

const quickLinks = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'schedule', href: '/schedule' },
  { key: 'books', href: '/books' },
  { key: 'videos', href: '/videos' },
  { key: 'volunteer', href: '/volunteer' },
];

export function Footer() {
  const { t } = useTranslation('footer');
  const { t: tCommon } = useTranslation('common');
  const { t: tNav } = useTranslation('nav');

  return (
    <footer className="border-t border-[rgba(122,86,26,0.12)] bg-[linear-gradient(180deg,rgba(253,249,242,0.96)_0%,rgba(244,236,223,0.96)_100%)]">
      <div className="container-custom py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr,0.9fr,0.9fr,1fr]">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[rgba(122,86,26,0.12)] bg-white/80 shadow-[0_12px_28px_rgba(41,22,11,0.08)]">
                <Image
                  src="/assets/Avdheshanandg mission logo.png"
                  alt="Avdheshanand Mission"
                  width={56}
                  height={56}
                  className="h-11 w-11 object-contain"
                />
              </div>
              <div>
                <p className="font-display text-xl text-spiritual-maroon">Avdheshanand Mission</p>
                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-spiritual-warmGray">Spiritual Platform</p>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-spiritual-warmGray">
              {t('tagline')}
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[rgba(122,86,26,0.12)] bg-white/75 text-spiritual-maroon transition-colors hover:border-[rgba(200,107,36,0.26)] hover:text-spiritual-saffron"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-spiritual-maroon">{t('quickLinks')}</h3>
            <div className="mt-5 space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl px-3 py-2 text-sm text-spiritual-warmGray transition-colors hover:bg-white/70 hover:text-spiritual-maroon"
                >
                  <span>{tNav(link.key)}</span>
                  <ArrowUpRight className="h-4 w-4 text-spiritual-saffron" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-spiritual-maroon">{t('contactUs')}</h3>
            <div className="mt-5 space-y-4 text-sm text-spiritual-warmGray">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-spiritual-saffron" />
                <span style={{ whiteSpace: 'pre-line' }}>{t('address')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-spiritual-saffron" />
                <span>{t('phone')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-spiritual-saffron" />
                <span>{t('email')}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/75 p-5 shadow-[0_16px_32px_rgba(41,22,11,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-spiritual-saffron">
              {t('stayConnected')}
            </p>
            <h3 className="mt-3 font-display text-2xl text-spiritual-maroon">
              {tCommon('sarveBlessing')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-spiritual-warmGray">
              {t('newsletterText')}
            </p>
            <Link href="/donate" className="mt-6 inline-flex btn-primary">
              {t('subscribeWithLove')}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[rgba(122,86,26,0.12)] pt-6 text-sm text-spiritual-warmGray md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {tCommon('copyright')} {tCommon('forSpiritualSeekers')}
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-spiritual-maroon">
              {tCommon('privacyPolicy')}
            </Link>
            <Link href="/terms" className="hover:text-spiritual-maroon">
              {tCommon('termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
