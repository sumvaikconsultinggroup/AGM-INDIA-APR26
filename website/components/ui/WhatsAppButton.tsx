'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919410160022';
  const welcomeMessage = encodeURIComponent(
    'Hari Om. I would like to know more about Swami Ji and upcoming programs.'
  );

  return (
    <motion.a
      href={`https://wa.me/${whatsappNumber}?text=${welcomeMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="whatsapp-button"
      className="fixed bottom-5 right-5 z-50 group"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.35, ease: 'easeOut' }}
      aria-label="Chat on WhatsApp"
    >
      <span
        className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/40 text-white transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #c86b24, #5c1d26)',
          boxShadow: '0 18px 34px rgba(41, 22, 11, 0.22)',
        }}
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
      </span>
      <span
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-[rgba(122,86,26,0.12)] bg-white/95 px-4 py-2 text-sm text-spiritual-maroon opacity-0 shadow-[0_12px_28px_rgba(41,22,11,0.12)] transition-opacity duration-300 group-hover:opacity-100"
      >
        Chat with us
      </span>
    </motion.a>
  );
}
