'use client';

import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageHero } from '@/components/ui/PageHero';

export function ScheduleHero() {
  const { t } = useTranslation('schedule');

  return (
    <PageHero
      eyebrow={t('hero.sanskritTitle')}
      title={t('hero.title')}
      highlight={t('hero.titleHighlight')}
      subtitle={t('hero.subtitle')}
      icon={<CalendarDays className="h-8 w-8" />}
    />
  );
}
