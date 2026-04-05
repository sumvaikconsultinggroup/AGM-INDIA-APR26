"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, ExternalLink, Instagram, Loader2, Plus } from "lucide-react"

export default function InstagramGrid({ accessToken, limit = 12 }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [visiblePosts, setVisiblePosts] = useState(6)
  const [loadingMore, setLoadingMore] = useState(false)


  const mockInstagramData = [
    {
      id: "1",
      media_url: "/placeholder.svg?height=400&width=400&text=Meditation+Session",
      caption:
        "Finding peace in the morning meditation session. Join us every day at sunrise. 🧘‍♀️ #meditation #peace #spirituality",
      like_count: 234,
      comments_count: 18,
      timestamp: "2024-01-15T08:30:00Z",
      permalink: "https://instagram.com/p/example1",
      media_type: "IMAGE",
    },
    {
      id: "2",
      media_url: "/placeholder.svg?height=400&width=400&text=Temple+Ceremony",
      caption: "Sacred ceremony at our temple. Blessed to witness such divine moments. 🙏 #temple #ceremony #blessed",
      like_count: 456,
      comments_count: 32,
      timestamp: "2024-01-14T18:45:00Z",
      permalink: "https://instagram.com/p/example2",
      media_type: "IMAGE",
    },
    {
      id: "3",
      media_url: "/placeholder.svg?height=400&width=400&text=Yoga+Practice",
      caption: "Morning yoga practice in our beautiful garden. Nature is the best teacher. 🌸 #yoga #nature #morning",
      like_count: 189,
      comments_count: 12,
      timestamp: "2024-01-13T07:15:00Z",
      permalink: "https://instagram.com/p/example3",
      media_type: "IMAGE",
    },
    {
      id: "4",
      media_url: "/placeholder.svg?height=400&width=400&text=Community+Gathering",
      caption:
        "Our spiritual community coming together for evening prayers. Unity in diversity. ✨ #community #prayers #unity",
      like_count: 312,
      comments_count: 25,
      timestamp: "2024-01-12T19:30:00Z",
      permalink: "https://instagram.com/p/example4",
      media_type: "IMAGE",
    },
    {
      id: "5",
      media_url: "/placeholder.svg?height=400&width=400&text=Sacred+Texts",
      caption:
        "Studying ancient wisdom from our sacred texts. Knowledge is the path to enlightenment. 📚 #wisdom #study #enlightenment",
      like_count: 167,
      comments_count: 8,
      timestamp: "2024-01-11T14:20:00Z",
      permalink: "https://instagram.com/p/example5",
      media_type: "IMAGE",
    },
    {
      id: "6",
      media_url: "/placeholder.svg?height=400&width=400&text=Sunset+Meditation",
      caption:
        "Sunset meditation overlooking the mountains. Perfect end to a blessed day. 🌅 #sunset #meditation #mountains",
      like_count: 523,
      comments_count: 41,
      timestamp: "2024-01-10T20:00:00Z",
      permalink: "https://instagram.com/p/example6",
      media_type: "IMAGE",
    },
    {
      id: "7",
      media_url: "/placeholder.svg?height=400&width=400&text=Spiritual+Workshop",
      caption:
        "Spiritual workshop on mindfulness and inner peace. Learning never stops. 🧠 #workshop #mindfulness #learning",
      like_count: 278,
      comments_count: 19,
      timestamp: "2024-01-09T16:45:00Z",
      permalink: "https://instagram.com/p/example7",
      media_type: "IMAGE",
    },
    {
      id: "8",
      media_url: "/placeholder.svg?height=400&width=400&text=Garden+Walk",
      caption: "Peaceful walk through our meditation garden. Every step is a prayer. 🌿 #garden #peace #prayer",
      like_count: 145,
      comments_count: 6,
      timestamp: "2024-01-08T11:30:00Z",
      permalink: "https://instagram.com/p/example8",
      media_type: "IMAGE",
    },
    {
      id: "9",
      media_url: "/placeholder.svg?height=400&width=400&text=Chanting+Circle",
      caption: "Evening chanting circle. The power of collective prayer and devotion. 🎵 #chanting #prayer #devotion",
      like_count: 389,
      comments_count: 28,
      timestamp: "2024-01-07T19:15:00Z",
      permalink: "https://instagram.com/p/example9",
      media_type: "IMAGE",
    },
    {
      id: "10",
      media_url: "/placeholder.svg?height=400&width=400&text=Lotus+Pond",
      caption: "The lotus pond in full bloom. Symbol of purity rising from muddy waters. 🪷 #lotus #purity #symbol",
      like_count: 456,
      comments_count: 33,
      timestamp: "2024-01-06T13:20:00Z",
      permalink: "https://instagram.com/p/example10",
      media_type: "IMAGE",
    },
    {
      id: "11",
      media_url: "/placeholder.svg?height=400&width=400&text=Candle+Ceremony",
      caption: "Candlelight ceremony for world peace. May light dispel all darkness. 🕯️ #candles #peace #light",
      like_count: 234,
      comments_count: 15,
      timestamp: "2024-01-05T20:30:00Z",
      permalink: "https://instagram.com/p/example11",
      media_type: "IMAGE",
    },
    {
      id: "12",
      media_url: "/placeholder.svg?height=400&width=400&text=Morning+Prayers",
      caption: "Starting the day with gratitude and prayers. Blessed morning to all. 🌅 #morning #prayers #gratitude",
      like_count: 345,
      comments_count: 22,
      timestamp: "2024-01-04T06:00:00Z",
      permalink: "https://instagram.com/p/example12",
      media_type: "IMAGE",
    },
    {
      id: "13",
      media_url: "/placeholder.svg?height=400&width=400&text=Sacred+Fire",
      caption: "Sacred fire ceremony purifying our intentions and prayers. 🔥 #sacredfire #ceremony #purification",
      like_count: 412,
      comments_count: 29,
      timestamp: "2024-01-03T17:15:00Z",
      permalink: "https://instagram.com/p/example13",
      media_type: "IMAGE",
    },
    {
      id: "14",
      media_url: "/placeholder.svg?height=400&width=400&text=Meditation+Hall",
      caption: "Our peaceful meditation hall where silence speaks louder than words. 🧘 #meditation #silence #peace",
      like_count: 298,
      comments_count: 16,
      timestamp: "2024-01-02T10:30:00Z",
      permalink: "https://instagram.com/p/example14",
      media_type: "IMAGE",
    },
    {
      id: "15",
      media_url: "/placeholder.svg?height=400&width=400&text=New+Year+Blessing",
      caption:
        "New Year blessings for all beings. May this year bring peace and enlightenment. ✨ #newyear #blessings #peace",
      like_count: 567,
      comments_count: 45,
      timestamp: "2024-01-01T00:00:00Z",
      permalink: "https://instagram.com/p/example15",
      media_type: "IMAGE",
    },
  ]

  // Fetch Instagram posts
  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setLoading(true)

        // For demonstration, we'll use mock data
        // Replace this with actual Instagram API call:
        /*
        const response = await fetch(
          `https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp,like_count,comments_count,permalink&limit=${limit}&access_token=${accessToken}`
        )
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error.message)
        }
        
        setPosts(data.data)
        */

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setPosts(mockInstagramData.slice(0, limit))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramPosts()
  }, [accessToken, limit])

  // Handle show more posts
  const handleShowMore = async () => {
    setLoadingMore(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show 6 more posts
    setVisiblePosts((prev) => Math.min(prev + 6, posts.length))
    setLoadingMore(false)
  }

  // Handle show less posts
  const handleShowLess = async () => {
    setLoadingMore(true)

    // Simulate loading delay for smooth UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Reset to initial 6 posts and scroll to top of section
    setVisiblePosts(6)
    setLoadingMore(false)

    // Smooth scroll to the section header
    const section = document.querySelector('[data-section="instagram-grid"]')
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Format date
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  // Truncate caption
  const truncateCaption = (caption, maxLength = 100) => {
    if (!caption) return ""
    return caption.length > maxLength ? caption.substring(0, maxLength) + "..." : caption
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-[#fcf9f5] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#B82A1E]/10 to-[#B82A1E]/5">
              <Instagram className="text-[#B82A1E]" size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-4">Our Instagram Journey</h2>
          </div>

          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#B82A1E] animate-spin mx-auto mb-4" />
              <p className="text-[#5D4037]/70">Loading our spiritual moments...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-[#fcf9f5] to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#B82A1E]/10 to-[#B82A1E]/5">
              <Instagram className="text-[#B82A1E]" size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-4">Our Instagram Journey</h2>
          </div>

          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <p className="text-[#5D4037]/70 mb-4">Unable to load Instagram posts at the moment.</p>
              <p className="text-sm text-[#5D4037]/50">Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative py-16 overflow-hidden bg-gradient-to-b from-[#fcf9f5] to-white"
      data-section="instagram-grid"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B82A1E]/0 via-[#B82A1E]/30 to-[#B82A1E]/0"></div>

      {/* Subtle background circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 border border-[#B82A1E]/5 rounded-full"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 border border-[#B82A1E]/5 rounded-full"></div>

      {/* Om symbol watermark */}
      <div className="absolute opacity-[0.02] text-[#B82A1E] text-[300px] font-serif top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        ॐ
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#B82A1E]/10 to-[#B82A1E]/5">
            <Instagram className="text-[#B82A1E]" size={28} />
          </div>

          <h2 className="relative inline-block mb-6 text-3xl md:text-4xl font-serif text-[#5D4037] after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-[#B82A1E] after:to-transparent after:bottom-0 after:left-0">
            Our Instagram Journey
          </h2>

          <p className="max-w-2xl mx-auto text-center leading-relaxed text-[#5D4037]/80">
            Follow our daily spiritual practices, community gatherings, and moments of peace shared with our global
            family.
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {posts.slice(0, visiblePosts).map((post) => (
            <div
              key={post.id}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-[#B82A1E]/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={post.media_url || "/placeholder.svg"}
                  alt={post.caption ? truncateCaption(post.caption, 50) : "Instagram post"}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <div className="flex items-center">
                        <Heart size={20} className="mr-1" />
                        <span className="font-medium">{post.like_count}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle size={20} className="mr-1" />
                        <span className="font-medium">{post.comments_count}</span>
                      </div>
                    </div>
                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm hover:underline"
                    >
                      View on Instagram
                      <ExternalLink size={14} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#B82A1E] font-medium">{formatDate(post.timestamp)}</span>
                  <div className="flex items-center space-x-3 text-[#5D4037]/60">
                    <div className="flex items-center">
                      <Heart size={14} className="mr-1" />
                      <span className="text-xs">{post.like_count}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle size={14} className="mr-1" />
                      <span className="text-xs">{post.comments_count}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[#5D4037]/80 leading-relaxed">{truncateCaption(post.caption)}</p>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-2 -right-2 text-[#B82A1E]/5 text-2xl pointer-events-none select-none group-hover:text-[#B82A1E]/10 transition-colors duration-300">
                ✿
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-row items-center justify-center gap-6 mt-12">
          {/* Show More/Less Button */}
          {posts.length > 6 && (
            <>
              {visiblePosts < posts.length ? (
                <button
                  onClick={handleShowMore}
                  disabled={loadingMore}
                  className="inline-flex items-center px-8 py-4 bg-white text-[#B82A1E] border-2 border-[#B82A1E] rounded-full hover:bg-[#B82A1E] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Loading More...
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="mr-2" />
                      Show More Posts ({posts.length - visiblePosts} remaining)
                    </>
                  )}
                </button>
              ) : visiblePosts > 6 ? (
                <button
                  onClick={handleShowLess}
                  disabled={loadingMore}
                  className="inline-flex items-center px-8 py-4 bg-white text-[#5D4037] border-2 border-[#5D4037] rounded-full hover:bg-[#5D4037] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={20} className="mr-2 animate-spin" />
                      Collapsing...
                    </>
                  ) : (
                    <>
                      <svg
                        width={20}
                        height={20}
                        className="mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                      Show Less (showing {visiblePosts} of {posts.length})
                    </>
                  )}
                </button>
              ) : null}
            </>
          )}

          {/* Follow Button */}
          <a
            href="https://instagram.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] text-white rounded-full hover:from-[#a32519] hover:to-[#7a1c13] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Instagram size={20} className="mr-2" />
            Follow Our Journey
          </a>
        </div>



      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#B82A1E]/0 via-[#B82A1E]/30 to-[#B82A1E]/0"></div>
    </section>
  )
}
