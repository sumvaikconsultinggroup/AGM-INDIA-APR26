'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Loader2, Radio, PlayCircle } from 'lucide-react';
import api from '@/lib/api';
import { PageHero } from '@/components/ui/PageHero';

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
        const res = await api.get('/livestream/active');
        const payload = (res.data as any)?.data || res.data || {};
        setActiveStream(payload.active || null);
        setUpcomingStreams(Array.isArray(payload.upcoming) ? payload.upcoming : []);
      } catch {
        setActiveStream(null);
        setUpcomingStreams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  return (
    <main className="min-h-screen pt-20">
      <PageHero
        tone="dark"
        eyebrow="Live"
        title="Watch spiritual"
        highlight="broadcasts"
        subtitle="Join live satsang, discourse, and special events, or review the next scheduled stream."
        icon={<Radio className="h-7 w-7" />}
      />

      <section className="bg-temple-warm py-12">
        <div className="container-custom">
          {loading && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-[rgba(122,86,26,0.12)] bg-white/80 text-spiritual-warmGray shadow-[0_18px_40px_rgba(41,22,11,0.06)]">
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-spiritual-saffron" />
              <p>Loading stream information...</p>
            </div>
          )}

          {!loading && (
            <div className="grid gap-8 lg:grid-cols-[1.5fr,0.9fr]">
              <div className="card-temple overflow-hidden p-4 md:p-6">
                {activeStream ? (
                  <>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                        Live now
                      </span>
                      <h1 className="font-display text-2xl text-spiritual-maroon md:text-3xl">
                        {activeStream.title}
                      </h1>
                    </div>
                    <div className="aspect-video overflow-hidden rounded-[24px] bg-black shadow-[0_18px_40px_rgba(17,10,8,0.18)]">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeStream.youtubeVideoId}?autoplay=1&rel=0`}
                        title={activeStream.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {activeStream.description && (
                      <p className="mt-5 max-w-3xl text-base leading-relaxed text-spiritual-warmGray">
                        {activeStream.description}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                    <PlayCircle className="h-16 w-16 text-spiritual-saffron" />
                    <h2 className="mt-5 font-display text-3xl text-spiritual-maroon">
                      No live stream right now
                    </h2>
                    <p className="mt-3 max-w-xl text-spiritual-warmGray">
                      The next satsang or discourse will appear here automatically once it is scheduled.
                    </p>
                  </div>
                )}
              </div>

              <aside className="card-warm p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-spiritual-saffron">
                  Upcoming
                </p>
                <h2 className="mt-3 font-display text-2xl text-spiritual-maroon">
                  Next scheduled streams
                </h2>

                <div className="mt-6 space-y-4">
                  {upcomingStreams.length > 0 ? (
                    upcomingStreams.map((stream) => (
                      <div key={stream._id} className="rounded-[22px] border border-[rgba(122,86,26,0.12)] bg-white/70 p-4">
                        <span className="inline-flex rounded-full bg-[rgba(200,107,36,0.12)] px-2.5 py-1 text-xs font-semibold text-spiritual-saffron">
                          {stream.streamType}
                        </span>
                        <h3 className="mt-3 font-display text-xl text-spiritual-maroon">
                          {stream.title}
                        </h3>
                        <p className="mt-2 flex items-center gap-2 text-sm text-spiritual-warmGray">
                          <CalendarDays className="h-4 w-4 text-spiritual-saffron" />
                          {new Date(stream.scheduledStart).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-[rgba(122,86,26,0.18)] bg-white/55 p-5 text-sm text-spiritual-warmGray">
                      No upcoming streams have been published yet.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
