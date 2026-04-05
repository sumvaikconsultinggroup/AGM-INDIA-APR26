// website/components/sections/LiveBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import axios from "axios";

export default function LiveBanner() {
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");

  useEffect(() => {
    const checkLive = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/livestream/active`);
        if (res.data.success && res.data.data.isLiveNow) {
          setIsLive(true);
          setStreamTitle(res.data.data.active.title);
        } else {
          setIsLive(false);
          setStreamTitle("");
        }
      } catch {
        setIsLive(false);
        setStreamTitle("");
      }
    };
    checkLive();
    const interval = setInterval(checkLive, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white overflow-hidden"
        >
          <Link href="/live" className="block">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE NOW
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline font-medium">
                {streamTitle}
              </span>
              <span className="text-red-200 hover:text-white transition-colors">
                Watch →
              </span>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
