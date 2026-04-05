// website/components/sections/DailyVichar.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

interface Vichar {
  titleHindi: string;
  titleEnglish: string;
  contentHindi: string;
  contentEnglish: string;
  source?: string;
  category: string;
  date: string;
}

export default function DailyVichar() {
  const [vichar, setVichar] = useState<Vichar | null>(null);
  const [lang, setLang] = useState<"hindi" | "english">("hindi");

  useEffect(() => {
    const fetchVichar = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/daily-vichar/today`);
        if (res.data.success) setVichar(res.data.data);
      } catch {
        // Silently fail — section just won't show
      }
    };
    fetchVichar();
  }, []);

  if (!vichar) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-spiritual-cream to-spiritual-parchment relative overflow-hidden">
      {/* Decorative Om symbol */}
      <div className="absolute top-4 right-8 text-6xl text-spiritual-saffron/10 font-noto-serif select-none">
        ॐ
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-spiritual-saffron font-cormorant text-sm uppercase tracking-widest mb-2">
            आज का विचार · Thought of the Day
          </p>

          {/* Language toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setLang("hindi")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                lang === "hindi"
                  ? "bg-spiritual-saffron text-white"
                  : "bg-white/50 text-gray-600 hover:bg-white"
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => setLang("english")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                lang === "english"
                  ? "bg-spiritual-saffron text-white"
                  : "bg-white/50 text-gray-600 hover:bg-white"
              }`}
            >
              English
            </button>
          </div>

          <h2 className="text-2xl md:text-3xl font-playfair text-spiritual-maroon mb-4">
            {lang === "hindi" ? vichar.titleHindi : vichar.titleEnglish}
          </h2>

          <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed font-cormorant italic max-w-2xl mx-auto">
            &ldquo;
            {lang === "hindi" ? vichar.contentHindi : vichar.contentEnglish}
            &rdquo;
          </blockquote>

          {vichar.source && (
            <p className="mt-4 text-sm text-spiritual-warmGray">
              — {vichar.source}
            </p>
          )}

          <p className="mt-6 text-xs text-gray-400">
            {new Date(vichar.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
