'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import api from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface Vichar {
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  date: string;
}

export default function DailyVichar() {
  const { i18n } = useTranslation();
  const [vichar, setVichar] = useState<Vichar | null>(null);

  useEffect(() => {
    const fetchVichar = async () => {
      try {
        const res = await api.get('/daily-vichar/today');
        const payload = (res.data as any)?.data || res.data;
        if (payload) setVichar(payload);
      } catch {
        setVichar(null);
      }
    };

    fetchVichar();
  }, []);

  const content = useMemo(() => {
    if (!vichar) return null;
    const isHindi = i18n.language?.startsWith('hi');
    return {
      title: isHindi ? vichar.titleHindi : vichar.titleEnglish,
      body: isHindi ? vichar.contentHindi : vichar.contentEnglish,
    };
  }, [i18n.language, vichar]);

  if (!vichar || !content) return null;

  return (
    <section className="bg-parchment py-10">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="card-temple mx-auto max-w-4xl p-7 md:p-10"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-spiritual-saffron">
                Daily reflection
              </p>
              <h2 className="mt-3 font-display text-2xl text-spiritual-maroon md:text-3xl">
                {content.title}
              </h2>
              <blockquote className="mt-5 text-lg leading-relaxed text-spiritual-warmGray md:text-xl">
                “{content.body}”
              </blockquote>
              {vichar.source && (
                <p className="mt-4 text-sm text-spiritual-warmGray">— {vichar.source}</p>
              )}
            </div>

            <div className="rounded-[24px] border border-[rgba(122,86,26,0.12)] bg-white/70 p-4 md:w-56">
              <Quote className="h-8 w-8 text-spiritual-saffron" />
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-spiritual-saffron">
                Today
              </p>
              <p className="mt-2 text-sm text-spiritual-warmGray">
                {new Date(vichar.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
