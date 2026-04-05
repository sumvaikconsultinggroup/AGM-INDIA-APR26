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
      className="fixed bottom-6 right-6 z-50 group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      aria-label="Chat on WhatsApp"
    >
      {/* Gold Glow Ring */}
      <span 
        className="absolute inset-0 rounded-full animate-ping" 
        style={{ 
          backgroundColor: 'rgba(212, 160, 23, 0.3)',
          animationDuration: '2s' 
        }} 
      />
      
      {/* Button with saffron/gold gradient */}
      <span 
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #FF6B00, #D4A017)',
          boxShadow: '0 0 30px rgba(212, 160, 23, 0.4), 0 4px 15px rgba(255, 107, 0, 0.3)',
        }}
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
      </span>
      
      {/* Tooltip with parchment background and gold border */}
      <span 
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none font-spiritual"
        style={{
          background: 'linear-gradient(180deg, #FFF8E7, #F5E6CC)',
          border: '1px solid rgba(212, 160, 23, 0.4)',
          color: '#800020',
          boxShadow: '0 4px 20px rgba(212, 160, 23, 0.15)',
        }}
      >
        Chat with us ✨
      </span>
    </motion.a>
  );
}
