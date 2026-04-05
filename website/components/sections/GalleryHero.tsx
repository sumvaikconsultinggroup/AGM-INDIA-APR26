'use client';

import { Images } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHero } from '@/components/ui/PageHero';

export function GalleryHero() {
  const { t } = useTranslation('gallery');

  return (
    <PageHero
      eyebrow={t('hero.sanskritTitle')}
      title={t('hero.title')}
      highlight={t('hero.titleHighlight')}
      subtitle={t('hero.subtitle')}
      icon={<Images className="h-8 w-8" />}
    />
  );
}
