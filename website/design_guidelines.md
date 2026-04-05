{
  "meta": {
    "project": "Swami Avdheshanand Giri Ji Maharaj — Spiritual Website",
    "goal": "Create a soothing, calming, and loving UI with gentle interactivity and mobile-first responsiveness. Keep visuals warm (saffron/cream/maroon), generous spacing, and micro-animations that feel contemplative.",
    "app_type": "Public website + content library (Next.js 15 App Router)",
    "primary_audience": ["devotees", "seekers", "first-time visitors"],
    "primary_tasks": ["learn about Swamiji", "view teachings & media", "check schedule / events", "contact / volunteer", "donate"],
    "success_actions": ["time-on-page", "low bounce on hero", "CTA clicks: Donate/Connect", "smooth nav without confusion"],
    "note_extensions": "Use .js files (not .tsx) for any new/updated components per this guideline. Named exports for components, default export for pages."
  },

  "brand_attributes": ["soothing", "compassionate", "trustworthy", "wise", "welcoming"],

  "typography": {
    "fonts": {
      "display_primary": "Playfair Display",
      "display_alt_for_quotes": "Cormorant Garamond",
      "body": "Inter",
      "import": "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-base sm:text-sm",
      "small": "text-sm"
    },
    "usage": {
      "h1": "font-display tracking-tight text-spiritual-deepRed",
      "h2": "font-display text-spiritual-maroon/90",
      "lead": "font-spiritual italic text-spiritual-warmGray/90",
      "body": "font-sans text-spiritual-warmGray"
    },
    "rhythm": "Use 1.6–1.8 line-height for paragraphs. Add 2–3x vertical spacing around headings compared to body size to maintain calm pacing."
  },

  "color_system": {
    "semantic": {
      "background": "#FDF8F3 (spiritual.warmWhite)",
      "surface": "#FFFFFF",
      "text_primary": "#5C5C5C (spiritual.warmGray)",
      "text_emphasis": "#6E0000 (spiritual.deepRed)",
      "primary": "#F97316",
      "primary_alt": "#EA580C",
      "accent_gold": "#D4A574",
      "accent_lotus": "#E8B4B8",
      "accent_sage": "#B8C4A8",
      "info": "#0EA5E9",
      "success": "#22C55E",
      "warning": "#F59E0B",
      "danger": "#DC2626"
    },
    "usage_notes": [
      "Prefer cream/warmWhite for reading areas.",
      "Use deepRed/maroon for emphasis and headings.",
      "Accents (gold/lotus/sage) for borders, rings, icons, gentle highlights.",
      "Do not use dark/saturated gradients; reserve gentle gradients for section backgrounds only and keep <=20% viewport coverage."
    ]
  },

  "gradients_and_texture": {
    "allowed": [
      "Section background wash (hero topper/bottom wave) with 2–3 mild colors.",
      "Decorative radial accents behind cards or icons.",
      "Subtle overlay on hero video using radial mask so overlay area remains <=20% viewport."
    ],
    "recipes": [
      {
        "name": "Warm Dawn",
        "css": "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 60%, #FEF3C7 100%)"
      },
      {
        "name": "Spiritual Whisper",
        "css": "radial-gradient(1200px 600px at 20% 10%, rgba(212,165,116,0.18) 0%, rgba(232,180,184,0.14) 35%, rgba(255,255,255,0) 70%)"
      }
    ],
    "texture": {
      "css_snippet": "background-image: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.03) 0 2px, transparent 2px), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.02) 0 2px, transparent 2px); background-size: 24px 24px, 28px 28px;",
      "usage": "Apply to section wrappers, never to content blocks with long text."
    }
  },

  "design_tokens_css": {
    "file": "app/app/globals.css (append in :root)",
    "variables": ":root{ --bg: #FDF8F3; --surface: #FFFFFF; --text: #5C5C5C; --text-emph: #6E0000; --primary-500:#F97316; --primary-600:#EA580C; --accent-gold:#D4A574; --accent-lotus:#E8B4B8; --accent-sage:#B8C4A8; --ring:#D4A574; --radius-sm:8px; --radius-md:12px; --radius-lg:20px; --shadow-warm:0 4px 20px -2px rgba(249,115,22,0.15); --shadow-warm-lg:0 10px 40px -10px rgba(249,115,22,0.2); --btn-radius:9999px; --btn-shadow:0 10px 20px -10px rgba(110,0,0,0.25); --transition-fast:200ms; --transition-med:350ms; }",
    "notes": [
      "Remove any transition-all. Use transition-colors, transition-shadow, transition-opacity, or explicit transform transitions only.",
      "Prefer rounded-full for primary CTAs (loving, soft)."
    ]
  },

  "navigation_enhancements": {
    "desktop": [
      "Underline motion indicator on hover (scale-x) with accent-gold.",
      "Active section highlight based on scroll (IntersectionObserver)."
    ],
    "mobile": [
      "Sliding panel already present. Add focus-visible rings and data-testid attributes.",
      "Lock body scroll (already implemented)."
    ],
    "progress_bar": {
      "description": "Optional top progress bar using scrollYProgress for smoothness.",
      "snippet_js": "// in Navbar.js\nimport { motion, useScroll } from 'framer-motion';\nexport function ScrollProgressBar(){ const { scrollYProgress } = useScroll(); return (<motion.div data-testid=\"global-scroll-progress\" className=\"fixed top-0 left-0 right-0 h-[3px] bg-accent-gold/30 z-[60]\" style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }} />);}"
    }
  },

  "hero_enhancement": {
    "goals": ["keep video", "improve readability", "reduce overlay gradient coverage", "add gentle entrance + parallax of badges"],
    "mask_overlay_css": ".hero-overlay-mask::after{ content:''; position:absolute; inset:0; pointer-events:none; background: radial-gradient(800px 400px at 50% 10%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0) 70%); }",
    "content_classes": "text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]",
    "cta_buttons": {
      "primary_classes": "inline-flex items-center justify-center px-7 py-3 rounded-full bg-primary-500 text-white shadow-[var(--btn-shadow)] hover:bg-primary-600 transition-colors duration-300 data-[state=active]:ring-2 ring-accent-gold",
      "secondary_classes": "inline-flex items-center justify-center px-7 py-3 rounded-full border border-white/70 text-white hover:text-spiritual-deepRed hover:bg-white transition-colors duration-300"
    },
    "testids": [
      "hero-discover-more-button",
      "hero-connect-button",
      "hero-scroll-indicator"
    ]
  },

  "card_design": {
    "base": "bg-white/85 backdrop-blur-lg border border-white/30 rounded-2xl shadow-[var(--shadow-warm)]",
    "hover": "hover:shadow-[var(--shadow-warm-lg)] hover:-translate-y-0.5 transition-shadow duration-300",
    "micro": "group relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-primary-50/0 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300",
    "title_classes": "font-display text-spiritual-deepRed",
    "testids": ["teaching-card", "event-card", "gallery-card"],
    "note": "Use motion.div with whileHover={{ y: -4 }} and transition={{ duration: 0.25, ease: 'easeOut' }}."
  },

  "whatsapp_button": {
    "style_update": "Softer, loving style with sage ring and breathe animation. Keep solid fill (no gradient) to respect small-element gradient rule.",
    "snippet_js": "import { motion } from 'framer-motion'; import { MessageCircle } from 'lucide-react';\nexport function WhatsAppButton(){ return (\n  <motion.a data-testid=\"floating-whatsapp-button\" href=\"https://wa.me/919999999999\" target=\"_blank\" rel=\"noopener noreferrer\" className=\"fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent-sage text-white shadow-lg ring-2 ring-accent-gold/40 flex items-center justify-center hover:ring-accent-gold/70 transition-shadow duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-gold/60\" whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>\n  <MessageCircle className=\"w-7 h-7\" aria-hidden=\"true\" />\n</motion.a> ); }",
    "a11y": "Ensure aria-label=\"Chat on WhatsApp\" if you omit visible text."
  },

  "micro_interactions": {
    "buttons": "Hover: slight shade shift + ring. Press: scale 0.98. Duration 180–220ms.",
    "cards": "Entrance fade-in-up on scroll. Hover lift by 2–4px; shadow intensifies.",
    "nav": "Underline grows from center; dropdown fades with 120–180ms delay per item.",
    "scroll": "Lenis smooth-scroll optional for gentler pace.",
    "framer_variants_js": "export const fadeInUp = { hidden:{opacity:0, y:20}, show:{opacity:1, y:0, transition:{duration:0.5, ease:'easeOut'}} }; export const liftHover = { whileHover:{ y:-4, transition:{ duration:0.2 } } };"
  },

  "grids_layouts": {
    "container": "container-custom (max-w-7xl px-4 sm:px-6 lg:px-8)",
    "sections": "section-padding (py-16 md:py-24 lg:py-32)",
    "grid_examples": [
      "Core teachings: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8",
      "Gallery: masonry-like with CSS columns on md+ or grid with auto-rows",
      "Events: grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
    ],
    "alignment": "Left-align body text. Center only hero headlines or short callouts."
  },

  "accessibility": {
    "contrast": "Maintain WCAG AA (4.5:1 for body, 3:1 for large headings).",
    "focus": "Visible focus rings on all interactive elements (ring-accent-gold/60).",
    "motion": "Respect prefers-reduced-motion: reduce parallax/auto animations.",
    "readability": "Avoid gradients behind long text blocks."
  },

  "testing": {
    "data_testid_policy": "All interactive and key informational elements must include data-testid using kebab-case role-based naming.",
    "examples": [
      "data-testid=\"navbar-link-about\"",
      "data-testid=\"hero-discover-more-button\"",
      "data-testid=\"teaching-card\"",
      "data-testid=\"event-register-button\"",
      "data-testid=\"donation-submit-button\"",
      "data-testid=\"contact-form\"",
      "data-testid=\"faq-accordion-item\""
    ]
  },

  "libraries": {
    "existing": ["Framer Motion", "Lucide React", "Tailwind"],
    "additions": [
      {
        "name": "Lenis (smooth, gentle scrolling)",
        "install": "npm i @studio-freight/lenis",
        "usage_js": "import { useEffect } from 'react'; import Lenis from '@studio-freight/lenis'; export function SmoothScroll(){ useEffect(()=>{ const lenis = new Lenis({ lerp: 0.07 }); const raf = (time)=>{ lenis.raf(time); requestAnimationFrame(raf); }; requestAnimationFrame(raf); return ()=>{ /* lenis has no destroy in v1, ignore */ }; },[]); return null; }"
      },
      {
        "name": "Sonner (toasts)",
        "install": "npm i sonner",
        "component_file": "/app/components/ui/sonner.js",
        "usage_js": "import { Toaster, toast } from 'sonner'; export function AppToaster(){ return <Toaster richColors position=\"top-center\" /> } // usage: toast.success('Message sent');"
      },
      {
        "name": "shadcn/ui (selective primitives)",
        "install": "npx shadcn@latest add button card accordion input textarea dialog calendar tooltip",
        "note": "Use shadcn primitives for form fields, accordion (FAQ), dialogs, and calendar in Events. Match tokens/colors in this guide."
      }
    ]
  },

  "shadcn_mapping": {
    "accordion": "Use for FAQ. Replace custom with Accordion from shadcn for keyboard/a11y.",
    "calendar": "Events page date-picker: shadcn Calendar."
  },

  "component_path": {
    "Navbar": "/app/components/layout/Navbar.js",
    "Footer": "/app/components/layout/Footer.js",
    "Hero": "/app/components/sections/Hero.js",
    "CoreTeachings": "/app/components/sections/CoreTeachings.js",
    "Events": "/app/components/sections/Events.js",
    "Gallery": "/app/components/sections/Gallery.js",
    "About": "/app/components/sections/About.js",
    "FAQ": "/app/components/sections/FAQ.js",
    "Contact": "/app/components/sections/Contact.js",
    "WhatsAppButton": "/app/components/ui/WhatsAppButton.js",
    "PageTransition": "/app/components/ui/PageTransition.js",
    "SectionHeading": "/app/components/ui/SectionHeading.js"
  },

  "component_specs": {
    "button_variants": {
      "primary": "rounded-full bg-primary-500 text-white px-6 py-3 shadow-[var(--btn-shadow)] hover:bg-primary-600 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-gold/60",
      "secondary": "rounded-full border border-spiritual-deepRed text-spiritual-deepRed px-6 py-3 hover:bg-spiritual-deepRed hover:text-white transition-colors duration-300",
      "ghost": "px-5 py-2 text-spiritual-warmGray hover:text-spiritual-deepRed transition-colors duration-200"
    },
    "faq_accordion": {
      "notes": "Use shadcn Accordion. One item open at a time. Add data-testid per item.",
      "testid_pattern": "faq-accordion-item-<slug>"
    },
    "calendar": {
      "notes": "Use shadcn Calendar on Events scheduling. Provide empty states and legend for event types.",
      "data_testids": ["events-calendar", "events-calendar-next", "events-calendar-prev"]
    }
  },

  "images_style": {
    "treatment": "Use warm, natural-light photographs. Add subtle 2px white border and 12px radius for portraits. Avoid harsh saturation.",
    "loading": "Use data-loaded attribute to fade-in (already in globals).",
    "lightbox": "Keep background as solid black/80, avoid gradients."
  },

  "image_urls": [
    {
      "category": "portrait/hero-support",
      "description": "Elderly man with saffron shawl at sunset (tone reference)",
      "image_url": "https://images.unsplash.com/photo-1762838105891-81bdd36ec44a?auto=format&fit=crop&w=1400&q=80"
    },
    {
      "category": "portrait/ambience",
      "description": "Rajasthani elder with tilak — texture and contrast reference",
      "image_url": "https://images.unsplash.com/photo-1637475907459-e9ea5578bb29?auto=format&fit=crop&w=1400&q=80"
    },
    {
      "category": "ritual/ambience",
      "description": "Ganga aarti at night — for gallery or storytelling",
      "image_url": "https://images.pexels.com/photos/34678646/pexels-photo-34678646.jpeg"
    },
    {
      "category": "portrait/ashram",
      "description": "Man in yellow turban before deity painting — for gallery",
      "image_url": "https://images.unsplash.com/photo-1718423116866-43ac4d6813aa?auto=format&fit=crop&w=1400&q=80"
    }
  ],

  "implementation_deltas": {
    "globals_css_updates": [
      "Replace any transition-all in utility/component classes with specific transitions (e.g., transition-colors, transition-shadow, transition-opacity).",
      "Create .hero-overlay-mask utility (see hero_enhancement.mask_overlay_css) and add to Hero section wrapper to keep gradient area <=20% viewport.",
      "Ensure .container-custom remains left-aligned; do not center entire app wrapper."
    ],
    "navbar": [
      "Add data-testid to each nav link (navbar-link-<slug>).",
      "Add ScrollProgressBar component for gentle feedback."
    ],
    "cards": [
      "Ensure card outer div includes data-testid matching role (teaching-card, event-card).",
      "Adopt micro_interactions.liftHover variants."
    ],
    "forms": [
      "Use shadcn Input/Textarea for Contact; add visible labels; add toasts via Sonner on submit.",
      "All inputs require data-testid (e.g., contact-name-input)."
    ]
  },

  "instructions_to_main_agent": [
    "Implement the specified deltas step-by-step; do not introduce new gradients beyond recipes; keep gradient coverage <=20% viewport.",
    "Migrate any newly created/updated components to .js and named exports. Pages use default export functions.",
    "Add data-testid attributes to all interactive elements using kebab-case role names.",
    "Adopt shadcn primitives for FAQ accordion and Events calendar. Use our colors via Tailwind classes and tokens.",
    "Ensure all hover/focus transitions are specific (no transition-all).",
    "Verify mobile-first spacing and typography scale; increase vertical whitespace where elements feel cramped.",
    "Run accessibility check for contrast; prefer text on solid backgrounds.",
    "Use Sonner for form success/error feedback."
  ],

  "inspiration_refs": [
    {
      "source": "Spiritual website styles (Wise Guide archetype)",
      "url": "https://bonniesorsby.com/spiritual-website-design-styles/"
    },
    {
      "source": "Parallax hero inspiration",
      "url": "https://colorlib.com/wp/psychic-website-design/"
    },
    {
      "source": "Glassmorphism best practices",
      "url": "https://www.nngroup.com/articles/glassmorphism/"
    }
  ],

  "general_ui_ux_guidelines": "- You must not apply universal transition. Eg: transition: all. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n- You must not center align the app container, ie do not add .App { text-align: center; } in the css file. This disrupts the human natural reading flow of text\n- NEVER: use AI assistant Emoji characters like🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use FontAwesome cdn or lucid-react library already installed in the package.json\n\n GRADIENT RESTRICTION RULE\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\nENFORCEMENT RULE:\n    • Id gradient area exceeds 20% of viewport OR affects readability, THEN use solid colors\n\nHow and where to use:\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, do not use purple color. Use color like light green, ocean blue, peach orange etc\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\nComponent Reuse:\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\nIMPORTANT: Do not use HTML based component like dropdown, calendar, toast etc. You MUST always use /app/frontend/src/components/ui/ only as a primary components as these are modern and stylish component\n\nBest Practices:\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\nExport Conventions:\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\nToasts:\n  - Use sonner for toasts\"\n  - Sonner component are located in /app/src/components/ui/sonner.tsx\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
}
