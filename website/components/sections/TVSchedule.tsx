// website/components/sections/TVSchedule.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Schedule {
  _id: string;
  channelName: string;
  channel: string;
  programName: string;
  dayOfWeek: number[];
  timeSlot: string;
  duration: number;
}

export default function TVSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await axios.get(`${apiUrl}/api/tv-schedule`);
        if (res.data.success) setSchedules(res.data.data);
      } catch {
        // Silently fail
      }
    };
    fetchSchedules();
  }, []);

  if (schedules.length === 0) return null;

  const channelIcon: Record<string, string> = {
    sanskar: "📺",
    aastha: "📡",
    other: "🖥️",
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-playfair text-spiritual-maroon text-center mb-2">
            Watch on Television
          </h2>
          <p className="text-center text-gray-500 text-sm mb-8">
            Swami Ji&apos;s pravachans on national TV channels
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-spiritual-cream rounded-xl p-5 border border-spiritual-sandstone/30"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {channelIcon[schedule.channel] || "📺"}
                  </span>
                  <span className="font-medium text-spiritual-maroon">
                    {schedule.channelName}
                  </span>
                </div>
                <h3 className="text-lg font-playfair text-gray-800">
                  {schedule.programName}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {schedule.dayOfWeek.map((d) => (
                    <span
                      key={d}
                      className="text-xs px-2 py-0.5 bg-spiritual-saffron/10 text-spiritual-saffron rounded-full"
                    >
                      {DAY_NAMES[d]}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {schedule.timeSlot} ({schedule.duration} min)
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
