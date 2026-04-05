'use client';

import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';
import { SectionHeading } from '../ui/SectionHeading';

const CONTACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTACT_ADDRESS ||
  'Harihar Ashram, Kankhal, Haridwar, Uttarakhand, India';
const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || '+91 94101 60022';
const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'office@avdheshanandg.org';

export function Contact() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      await api.post('/connect', formState);
      setSubmitStatus('success');
      setStatusMessage('Your message has been sent successfully. We will be in touch soon.');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Failed to send message. Please try again later.');
      console.error('Contact form error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-temple-warm">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Contact"
          title="Connect with the mission"
          subtitle="Reach out for spiritual guidance, ashram visits, events, or any general enquiry."
        />

        <div className="grid gap-8 lg:grid-cols-[0.92fr,1.08fr]">
          <div className="card-warm p-6 md:p-8">
            <div className="grid gap-5">
              {[
                { icon: MapPin, title: 'Address', content: CONTACT_ADDRESS },
                { icon: Phone, title: 'Phone', content: CONTACT_PHONE },
                { icon: Mail, title: 'Email', content: CONTACT_EMAIL },
                { icon: Clock, title: 'Darshan Timings', content: 'Daily 6:00 AM - 8:00 PM' },
              ].map((item) => (
                <div key={item.title} className="rounded-[22px] border border-[rgba(122,86,26,0.12)] bg-white/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(200,107,36,0.12)] text-spiritual-saffron">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-spiritual-saffron">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-spiritual-warmGray">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-[rgba(122,86,26,0.12)] shadow-[0_16px_30px_rgba(41,22,11,0.06)]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d78.123!3d29.945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDU2JzQyLjAiTiA3OMKwMDcnMjIuOCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Map showing Kankhal Ashram, Haridwar"
              />
            </div>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="card-temple p-6 md:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-spiritual-saffron">
              Send a message
            </p>
            <h3 className="mt-3 font-display text-3xl text-spiritual-maroon">
              We’ll help you find the right next step
            </h3>

            <div className="mt-6 space-y-4">
              {submitStatus === 'success' && (
                <div className="flex items-start gap-3 rounded-[20px] border border-green-200 bg-green-50 px-4 py-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-700">{statusMessage}</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-start gap-3 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3">
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">{statusMessage}</p>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-spiritual-maroon">Your name</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-2xl border border-[rgba(122,86,26,0.16)] bg-white/85 px-4 py-3 text-spiritual-maroon placeholder:text-spiritual-warmGray focus:border-[rgba(200,107,36,0.35)]"
                  placeholder="Enter your name"
                  required
                  disabled={submitting}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-spiritual-maroon">Email address</span>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full rounded-2xl border border-[rgba(122,86,26,0.16)] bg-white/85 px-4 py-3 text-spiritual-maroon placeholder:text-spiritual-warmGray focus:border-[rgba(200,107,36,0.35)]"
                  placeholder="Enter your email"
                  required
                  disabled={submitting}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-spiritual-maroon">Your message</span>
                <textarea
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-2xl border border-[rgba(122,86,26,0.16)] bg-white/85 px-4 py-3 text-spiritual-maroon placeholder:text-spiritual-warmGray focus:border-[rgba(200,107,36,0.35)]"
                  placeholder="Write your message here..."
                  required
                  disabled={submitting}
                />
              </label>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send message'
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
