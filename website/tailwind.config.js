/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Enhanced spiritual/traditional Indian palette
        primary: {
          50: '#FFF8E7',
          100: '#FFECB3',
          200: '#FFD54F',
          300: '#FFB300',
          400: '#FF9800',
          500: '#FF6B00',  // Deep Saffron - primary brand
          600: '#E65100',
          700: '#BF360C',
          800: '#800020',  // Sacred Maroon
          900: '#4A0010',
        },
        gold: {
          50: '#FFFDF5',
          100: '#FFF8E1',
          200: '#FFECB3',
          300: '#FFD54F',
          400: '#D4A017',  // Temple Gold
          500: '#B8860B',
          600: '#996515',
          700: '#7A5200',
        },
        spiritual: {
          cream: '#FFF8E7',
          parchment: '#F5E6CC',
          sandstone: '#E8D5B7',
          warmWhite: '#FFFDF5',
          saffron: '#FF6B00',
          maroon: '#800020',
          deepRed: '#6E0000',
          vermillion: '#E34234',
          peacock: '#006D6F',
          lotus: '#E8A0BF',
          warmGray: '#8B7E74',
        },
        accent: {
          gold: '#D4A017',
          lotus: '#E8A0BF',
          sage: '#B8C4A8',
          peacock: '#006D6F',
          vermillion: '#E34234',
        },
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Playfair Display', 'serif'],
        sanskrit: ['var(--font-noto-serif)', 'Noto Serif Devanagari', 'serif'],
        spiritual: ['var(--font-cormorant)', 'Cormorant Garamond', 'serif'],
        body: ['var(--font-inter)', 'Inter', 'sans-serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px rgba(212, 160, 23, 0.15)',
        'warm-lg': '0 10px 40px rgba(212, 160, 23, 0.2)',
        'glow': '0 0 30px rgba(212, 160, 23, 0.3)',
        'glow-lg': '0 0 60px rgba(212, 160, 23, 0.4)',
        'inner-warm': 'inset 0 2px 10px rgba(212, 160, 23, 0.1)',
        'temple': '0 8px 32px rgba(128, 0, 32, 0.15), 0 0 0 1px rgba(212, 160, 23, 0.2)',
        'card-ornate': '0 4px 24px rgba(128, 0, 32, 0.1), 0 0 0 1px rgba(212, 160, 23, 0.15)',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      columns: {
        '2': '2',
        '3': '3',
        '4': '4',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        'diya-flame': {
          '0%, 100%': { transform: 'scaleY(1) rotate(-1deg)', opacity: '1' },
          '25%': { transform: 'scaleY(1.1) rotate(1deg)', opacity: '0.9' },
          '50%': { transform: 'scaleY(0.95) rotate(-0.5deg)', opacity: '1' },
          '75%': { transform: 'scaleY(1.05) rotate(0.5deg)', opacity: '0.95' },
        },
        'mandala-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'golden-shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'lotus-bloom': {
          '0%': { transform: 'scale(0.8) rotate(-5deg)', opacity: '0' },
          '50%': { transform: 'scale(1.05) rotate(2deg)', opacity: '0.8' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'parallax-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        'flip-card': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scroll-reveal': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'typewriter': {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 160, 23, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 160, 23, 0.8), 0 0 60px rgba(255, 107, 0, 0.4)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.8s ease-out',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'fade-in-down': 'fade-in-down 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
        'diya-flame': 'diya-flame 3s ease-in-out infinite',
        'mandala-spin': 'mandala-spin 60s linear infinite',
        'golden-shimmer': 'golden-shimmer 3s linear infinite',
        'lotus-bloom': 'lotus-bloom 1.2s ease-out',
        'parallax-float': 'parallax-float 6s ease-in-out infinite',
        'flip-card': 'flip-card 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-left': 'slide-in-left 0.6s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
        'scroll-reveal': 'scroll-reveal 0.8s ease-out forwards',
        'typewriter': 'typewriter 3s steps(40) forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-warm': 'linear-gradient(135deg, #FFF8E7 0%, #FFECB3 50%, #FFF8E1 100%)',
        'gradient-spiritual': 'linear-gradient(180deg, #FFFDF5 0%, #FFF8E7 100%)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.backface-visible': {
          'backface-visibility': 'visible',
          '-webkit-backface-visibility': 'visible',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
          '-webkit-backface-visibility': 'hidden',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.transform-style-flat': {
          'transform-style': 'flat',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.perspective-2000': {
          'perspective': '2000px',
        },
      });
    },
  ],
};
