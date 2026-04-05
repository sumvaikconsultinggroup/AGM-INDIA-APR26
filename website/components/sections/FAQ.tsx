'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SectionHeading } from '../ui/SectionHeading';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: 'Who is Swami Avdheshanand Giri Ji Maharaj?',
    answer: 'Swami Ji is the Acharya Mahamandaleshwar of Juna Akhara and President of the Hindu Dharma Acharya Sabha. He is a globally respected spiritual leader, Vedanta scholar, humanitarian, and guide to millions of seekers.',
  },
  {
    question: 'What is Avdheshanandg Mission (AGM)?',
    answer: 'AGM (Avdheshanandg Mission, India) is a spiritual and social organization founded under Swami Ji\'s guidance. Its aim is to spread Vedantic wisdom and serve humanity through education, healthcare, rural development, and spiritual upliftment.',
  },
  {
    question: 'How can I attend Swami Ji\'s satsangs and discourses?',
    answer: 'You may join Swami Ji\'s live discourses at ashrams and events listed in the Schedule section. His teachings are also broadcast on Sanskar, Aastha TV, YouTube, and the official Swami Ji App.',
  },
  {
    question: 'Where are Swami Ji\'s ashrams located?',
    answer: 'Swami Ji has established several ashrams in India, run under different charitable trusts. The prominent ashrams are located in Haridwar (Kankhal) and Ambala (Haryana), serving as centers for satsangs, seva, and spiritual learning.',
  },
  {
    question: 'How can I contribute to Swami Ji\'s mission?',
    answer: 'You can support AGM through donations or volunteering. All contributions help sustain Swami Ji\'s vision of seva (service) and spiritual upliftment.',
  },
  {
    question: 'How can I meet Swami Ji personally?',
    answer: 'Appointments can be requested through official channels. The seva teams managing his ashrams and trusts review requests and confirm availability when possible.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-temple-warm">
      <div className="container-custom">
        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Find answers to common questions about Swami Ji and the mission"
        />

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="mb-4"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full text-left p-6 rounded-xl transition-all duration-300 border-l-4 ${
                  openIndex === index 
                    ? 'bg-spiritual-cream border-gold-400 shadow-warm' 
                    : 'bg-spiritual-warmWhite border-gold-400/30 hover:border-gold-400/60 hover:shadow-warm'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-spiritual-maroon pr-4 text-left">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    openIndex === index 
                      ? 'bg-spiritual-saffron border-spiritual-saffron text-white rotate-180' 
                      : 'bg-gold-100 border-gold-400/30 text-spiritual-saffron'
                  }`}>
                    {openIndex === index ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="divider-rangoli my-4" />
                      <p className="text-spiritual-warmGray leading-relaxed font-body">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
