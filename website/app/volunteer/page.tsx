'use client';

import { motion } from 'framer-motion';
import { Heart, Users, Calendar, MapPin, Send, Award, Globe, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import api from '../../lib/api';
import { useTranslation } from 'react-i18next';

const volunteerAreas = [
  {
    title: 'Kumbh Mela Seva',
    description: 'Join the sacred service during Maha Kumbh — from devotee assistance to environmental stewardship at the world\'s largest gathering.',
    icon: Calendar,
    volunteers: '5,000+',
  },
  {
    title: 'Ashram Seva',
    description: 'Contribute to daily operations at Harihar Ashram, Kankhal — hospitality, kitchen service, maintenance, and spiritual program support.',
    icon: MapPin,
    volunteers: '500+',
  },
  {
    title: 'Community Outreach',
    description: 'Participate in healthcare camps, food distribution drives, and education programs in underserved communities across India.',
    icon: Users,
    volunteers: '1,000+',
  },
];

const impactStats = [
  { value: '5,000+', label: 'Active Volunteers', icon: Users },
  { value: '100+', label: 'Events Organized', icon: Calendar },
  { value: '50+', label: 'Cities Reached', icon: Globe },
  { value: '50,000+', label: 'Lives Touched', icon: Heart },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  availability: string[];
  message: string;
}

export default function VolunteerPage() {
  const { t } = useTranslation('volunteer');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    areaOfInterest: '',
    availability: [],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleAvailabilityChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(option)
        ? prev.availability.filter(a => a !== option)
        : [...prev.availability, option],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      await api.post('/volunteer', formData);
      setSubmitStatus('success');
      setStatusMessage('Thank you for your interest in volunteering! We will contact you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        areaOfInterest: '',
        availability: [],
        message: '',
      });
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
        setStatusMessage('');
      }, 5000);
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('Failed to submit application. Please try again later.');
      console.error('Volunteer form error:', error);
      
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
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-maroon-gradient py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-gold-400 blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 rounded-full bg-gold-300 blur-3xl animate-pulse-soft animation-delay-500" />
        </div>
        
        {/* Gold borders */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow animate-breathe">
              <Heart className="w-10 h-10 text-white" />
            </div>
            
            <span className="text-gold-300/80 font-sanskrit text-lg tracking-wider">{t('hero.sanskritTitle')}</span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-gold-200 mt-2 mb-6">
              {t('hero.title')} <span className="text-gradient-gold">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-gold-100/80 text-lg md:text-xl leading-relaxed font-body">
              {t('hero.subtitle')}
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#register" className="btn-gold text-lg px-8 py-4">
                {t('hero.ctaJoin')}
                <Heart className="w-5 h-5 ml-2" />
              </a>
              <a href="#areas" className="btn-ghost text-gold-200 border-2 border-gold-400/50 hover:bg-gold-400/10 px-8 py-4 rounded-lg">
                {t('hero.ctaLearn')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Impact Stats Section - Styled like JourneyStats */}
      <section className="section-padding bg-maroon-gradient relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-mandala opacity-20" />
        
        <div className="container-custom relative z-10">
          <div className="text-center mb-12">
            <span className="text-gold-400 font-sanskrit text-lg">प्रभाव</span>
            <h2 className="font-display text-3xl md:text-4xl text-gold-200 mt-2 mb-4">
              Our <span className="text-gradient-gold">Impact</span>
            </h2>
            <div className="flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-gold-400" />
              <Award className="w-5 h-5 text-gold-400" />
              <span className="w-8 h-px bg-gold-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                {/* Gold medallion */}
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-display text-gold-200 mb-1">
                  {stat.value}
                </div>
                <div className="text-gold-100/70 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Volunteer Areas */}
      <section id="areas" className="section-padding bg-temple-warm">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-gold-500 font-sanskrit text-lg">सेवा के क्षेत्र</span>
            <h2 className="font-display text-3xl md:text-4xl text-spiritual-maroon mt-2 mb-4">
              Ways to <span className="text-gradient-gold">Volunteer</span>
            </h2>
            <p className="text-spiritual-warmGray max-w-xl mx-auto">
              Choose how you&apos;d like to serve and make a difference
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-8 h-px bg-gold-400" />
              <span className="text-gold-400">◆</span>
              <span className="w-8 h-px bg-gold-400" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {volunteerAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-temple p-8 text-center group hover:shadow-temple transition-shadow duration-300"
              >
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center border-2 border-gold-400/30 group-hover:border-gold-400 transition-colors">
                  <area.icon className="w-10 h-10 text-spiritual-maroon" />
                </div>
                
                <h3 className="font-display text-2xl text-spiritual-maroon mb-3 group-hover:text-spiritual-saffron transition-colors">
                  {area.title}
                </h3>
                <p className="text-spiritual-warmGray mb-6 leading-relaxed">
                  {area.description}
                </p>
                
                {/* Volunteer count badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-100 text-gold-600">
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{area.volunteers} volunteers</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Registration Form */}
      <section id="register" className="section-padding bg-parchment">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="card-temple p-8 md:p-10">
              {/* Decorative top */}
              <div className="flex justify-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-glow">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h3 className="font-display text-2xl md:text-3xl text-spiritual-maroon text-center mb-2">
                {t('register.title')}
              </h3>
              <p className="text-center text-spiritual-warmGray mb-8">
                {t('register.subtitle')}
              </p>

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 mb-6"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{statusMessage}</p>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-6"
                >
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{statusMessage}</p>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name and Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                      {t('register.fullName')}
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon placeholder:text-spiritual-warmGray/50 transition-all duration-300"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                      {t('register.emailAddress')}
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon placeholder:text-spiritual-warmGray/50 transition-all duration-300"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>
                
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                    {t('register.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon placeholder:text-spiritual-warmGray/50 transition-all duration-300"
                    disabled={submitting}
                  />
                </div>
                
                {/* Area of Interest */}
                <div>
                  <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                    Area of Interest
                  </label>
                  <select 
                    value={formData.areaOfInterest}
                    onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon transition-all duration-300"
                    disabled={submitting}
                  >
                    <option value="">Select your preferred area</option>
                    <option value="events">Event Support</option>
                    <option value="community">Community Service</option>
                    <option value="ashram">Ashram Activities</option>
                    <option value="all">All Areas</option>
                  </select>
                </div>
                
                {/* Availability */}
                <div>
                  <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                    Availability
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {['Weekdays', 'Weekends', 'Flexible'].map((option) => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.availability.includes(option)}
                          onChange={() => handleAvailabilityChange(option)}
                          className="w-4 h-4 rounded border-gold-400 text-gold-500 focus:ring-gold-400"
                          disabled={submitting}
                        />
                        <span className="text-spiritual-warmGray">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-spiritual-maroon mb-2">
                    Tell Us About Yourself
                  </label>
                  <textarea
                    placeholder="Share your motivation to serve and any relevant experience..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-spiritual-warmWhite border-2 border-gold-300 focus:border-gold-500 focus:ring-4 focus:ring-gold-200/50 focus:outline-none text-spiritual-maroon placeholder:text-spiritual-warmGray/50 resize-none transition-all duration-300"
                    disabled={submitting}
                  />
                </div>
                
                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-lg group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('register.submitting')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      {t('register.submitApplication')}
                    </>
                  )}
                </button>
              </form>
              
              {/* Trust note */}
              <p className="mt-6 text-center text-sm text-spiritual-warmGray">
                By submitting, you agree to be contacted about volunteer opportunities.
                <br />
                <span className="text-gold-600">We respect your privacy.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="divider-rangoli" />

      {/* Testimonial Section */}
      <section className="section-padding bg-temple-warm">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="card-temple p-8 md:p-12">
              <span className="text-6xl text-gold-400 font-serif leading-none">&ldquo;</span>
              <blockquote className="font-spiritual text-xl md:text-2xl text-spiritual-maroon leading-relaxed mt-2 mb-6">
                Seva is not just about giving your time or effort; it is about 
                offering your heart. Through selfless service, we dissolve the ego 
                and experience the divine within ourselves and others.
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <span className="w-12 h-px bg-gold-400" />
                <span className="font-display text-gold-600">Swami Avdheshanand Giri Ji</span>
                <span className="w-12 h-px bg-gold-400" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
