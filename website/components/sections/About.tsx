'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';

export function About() {
  return (
    <section id="about" className="section-padding bg-temple-warm relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-gold-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 w-80 h-80 rounded-full bg-gold-400/20 blur-3xl" />

      <div className="container-custom relative">
        <SectionHeading
          title="About Swami Ji"
          subtitle="A beacon of spiritual wisdom illuminating the path to self-realization"
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image with Gold Oval Frame */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            {/* Ornamental gold oval frame */}
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold-400/20 via-gold-300/10 to-gold-400/20 blur-xl" />

              {/* Gold border frame */}
              <div className="relative w-72 h-96 md:w-80 md:h-[28rem] rounded-full overflow-hidden border-4 border-gold-400 shadow-glow">
                <Image
                  src="/assets/Prabhushree ji 01_.webp"
                  alt="Swami Avdheshanand Giri Ji Maharaj"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Warm Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-spiritual-maroon/20 to-transparent" />
              </div>

              {/* Decorative corner flourishes */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-gold-400 rounded-tl-full" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-gold-400 rounded-tr-full" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-gold-400 rounded-bl-full" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-gold-400 rounded-br-full" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute -bottom-6 right-0 lg:right-8 card-temple p-5 max-w-xs shadow-warm-lg"
            >
              <p className="text-spiritual-saffron font-display text-lg mb-1">Acharya Mahamandaleshwar</p>
              <p className="text-spiritual-warmGray text-sm">Juna Akhara&apos;s Peethadheeshwar</p>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Quote Card with Temple Styling */}
            <div className="card-temple p-8 relative">
              <Quote className="absolute top-4 left-4 w-10 h-10 text-gold-400/50" />
              <blockquote className="font-spiritual italic text-spiritual-maroon fluid-text-xl leading-relaxed pl-8">
                &quot;True knowledge is not merely information; it is transformation. When wisdom enters the heart, it changes not only how we think but how we live.&quot;
              </blockquote>
              <p className="mt-4 text-right text-gold-600 font-display">
                — Swami Avdheshanand Giri Ji
              </p>
            </div>

            {/* Divider */}
            <div className="divider-rangoli" />

            {/* Description */}
            <p className="text-spiritual-warmGray font-body fluid-text-base leading-relaxed">
              Swami Ji is the Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha. A globally respected spiritual leader, Vedanta scholar, humanitarian, and guide to millions of seekers worldwide.
            </p>

            {/* CTA */}
            <motion.div
              whileHover={{ x: 5 }}
              className="inline-block"
            >
              <Link href="/about" className="btn-primary group">
                Learn More About Swami Ji
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
