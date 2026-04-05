'use client';

import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { MapPin, Phone, Mail, Clock, Heart, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';

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
      setStatusMessage('Your message has been sent successfully! We will get back to you soon.');
      setFormState({ name: '', email: '', message: '' });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Failed to send message. Please try again later.');
      console.error('Contact form error:', error);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="section-padding bg-maroon-gradient text-white relative overflow-hidden">
      {/* Decorative Om/Lotus Background Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-48 h-48 rounded-full border-4 border-gold-400" />
        <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border-2 border-gold-400" />
        {/* Om symbol using text */}
        <div className="absolute top-1/4 right-1/4 text-9xl font-sanskrit text-gold-400/20">ॐ</div>
        <div className="absolute bottom-1/4 left-1/4 text-7xl font-sanskrit text-gold-400/15">ॐ</div>
      </div>

      <div className="container-custom relative">
        <SectionHeading
          title="Connect with Us"
          subtitle="Reach out for spiritual guidance, ashram visits, or any inquiries"
          className="text-white [&_h2]:text-gold-200 [&_p]:text-gold-100/80 [&_div]:border-gold-400/50"
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Address', content: CONTACT_ADDRESS },
                { icon: Phone, title: 'Phone', content: CONTACT_PHONE },
                { icon: Mail, title: 'Email', content: CONTACT_EMAIL },
                { icon: Clock, title: 'Darshan Timings', content: 'Daily 6:00 AM - 8:00 PM' },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-400/20 border border-gold-400/40 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-display text-gold-200 mb-1">{item.title}</p>
                    <p className="text-gold-100/70 font-body">{item.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Map */}
            <div className="aspect-video rounded-xl overflow-hidden border-2 border-gold-400/30 shadow-glow">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d78.123!3d29.945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDU2JzQyLjAiTiA3OMKwMDcnMjIuOCJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                className="opacity-80"
                title="Map showing Kankhal Ashram, Haridwar"
              />
            </div>
          </motion.div>

          {/* Contact Form with Temple Card Styling */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="card-temple bg-spiritual-cream/95 backdrop-blur-sm p-8 space-y-6 border-ornamental">
              <h3 className="font-display text-2xl text-spiritual-maroon mb-6">Send us a Message</h3>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{statusMessage}</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{statusMessage}</p>
                </motion.div>
              )}

              <div>
                <label className="block text-spiritual-warmGray text-sm mb-2 font-body">Your Name</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-spiritual-warmWhite border border-gold-400/30 text-spiritual-maroon placeholder-spiritual-warmGray/50 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-body"
                  placeholder="Enter your name"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-spiritual-warmGray text-sm mb-2 font-body">Email Address</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-spiritual-warmWhite border border-gold-400/30 text-spiritual-maroon placeholder-spiritual-warmGray/50 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all font-body"
                  placeholder="Enter your email"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-spiritual-warmGray text-sm mb-2 font-body">Your Message</label>
                <textarea
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-spiritual-warmWhite border border-gold-400/30 text-spiritual-maroon placeholder-spiritual-warmGray/50 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all resize-none font-body"
                  placeholder="Write your message here..."
                  required
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full justify-center group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send with Love</span>
                    <Heart className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
