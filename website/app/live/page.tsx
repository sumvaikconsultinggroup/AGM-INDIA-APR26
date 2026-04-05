// website/app/live/page.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Stream {
  _id: string;
  title: string;
  description?: string;
  youtubeVideoId: string;
  streamType: string;
  scheduledStart: string;
  isLive: boolean;
}

export default function LivePage() {
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [upcomingStreams, setUpcomingStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
        const res = await axios.get(`${apiUrl}/api/livestream/active`);
        if (res.data.success) {
          setActiveStream(res.data.data.active);
          setUpcomingStreams(res.data.data.upcoming);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spiritual-cream">
        <div className="text-spiritual-warmGray">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-spiritual-cream pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeStream ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                LIVE
              </span>
              <h1 className="text-2xl font-playfair text-spiritual-maroon">
                {activeStream.title}
              </h1>
            </div>

            {/* YouTube Embed */}
            <div className="aspect-video rounded-xl overflow-hidden shadow-warm-lg bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeStream.youtubeVideoId}?autoplay=1&rel=0`}
                title={activeStream.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {activeStream.description && (
              <p className="mt-4 text-gray-600 max-w-3xl">
                {activeStream.description}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 text-spiritual-saffron/30">ॐ</div>
            <h1 className="text-2xl font-playfair text-spiritual-maroon mb-2">
              No Live Stream Right Now
            </h1>
            <p className="text-gray-500">
              Check back during scheduled satsang times
            </p>
          </div>
        )}

        {/* Upcoming Streams */}
        {upcomingStreams.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-playfair text-spiritual-maroon mb-4">
              Upcoming Streams
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingStreams.map((stream) => (
                <div
                  key={stream._id}
                  className="bg-white rounded-xl p-4 shadow-warm border border-spiritual-sandstone/30"
                >
                  <span className="text-xs px-2 py-0.5 bg-spiritual-saffron/10 text-spiritual-saffron rounded-full">
                    {stream.streamType}
                  </span>
                  <h3 className="mt-2 font-medium text-spiritual-maroon">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(stream.scheduledStart).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
