import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { useTranslation } from "react-i18next"; // Import translation hook

export default function NotFound() {
  const { t } = useTranslation(); // Add translation hook
  
  return (
    <div className="min-h-screen bg-gradient-to-b h-full from-[#fcf9f5] to-[#f5efe8] flex flex-col items-center justify-start pt-24 sm:pt-28 md:pt-32 p-4 sm:p-6 md:p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B82A1E]/0 via-[#B82A1E]/30 to-[#B82A1E]/0"></div>

      {/* Mandala-inspired decorative circles */}
      <div className="absolute top-10 right-10 w-64 h-64 border border-[#B82A1E]/5 rounded-full"></div>
      <div className="absolute top-14 right-14 w-48 h-48 border border-[#B82A1E]/5 rounded-full"></div>
      <div className="absolute top-20 right-20 w-32 h-32 border border-[#B82A1E]/5 rounded-full"></div>

      {/* Om symbol watermark */}
      <div className="absolute opacity-[0.03] text-[#B82A1E] text-[400px] font-serif top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        ॐ
      </div>

      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* Lotus flower symbol */}
        <div className="mb-6 text-[#B82A1E] text-4xl">✿</div>

        {/* 404 display */}
        <div className="relative mb-6">
          <h1 className="text-9xl sm:text-9xl font-serif font-bold text-[#B82A1E]/10">404</h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            <p className="text-xl sm:text-2xl font-serif text-[#5D4037]">{t("notFound.pageNotFound")}</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif text-[#5D4037]">
            {t("notFound.pathCannotBeFound")}
          </h2>
          <p className="text-[#5D4037]/80 max-w-xl mx-auto">
            {t("notFound.enlightenmentMessage")}
          </p>
        </div>

        {/* Simple home button */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-white transition-colors duration-300 rounded-lg bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] hover:from-[#a32519] hover:to-[#7a1c13]"
          >
            <Home size={18} className="mr-2" />
            <span>{t("notFound.returnToHome")}</span>
          </Link>
        </div>

        {/* Inspirational quote */}
        <div className="max-w-lg p-6 mx-auto bg-white border rounded-lg shadow-sm border-[#E0D6CC]">
          <blockquote className="italic text-[#5D4037]/80">
            {t("notFound.quote")}
          </blockquote>
          <div className="mt-2 text-sm font-medium text-right text-[#B82A1E]">
            — {t("notFound.quoteAttribution")}
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#B82A1E]/0 via-[#B82A1E]/30 to-[#B82A1E]/0"></div>
      </div>
    </div>
  );
}
