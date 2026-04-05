"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Repeat2, Share, ExternalLink, Twitter, Loader2, Calendar, Plus } from "lucide-react"

export default function TwitterFeed({ bearerToken, username, limit = 10 }) {
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [visibleTweets, setVisibleTweets] = useState(3) 
  const [loadingMore, setLoadingMore] = useState(false)


  const mockTwitterData = {
    user: {
      id: "1234567890",
      username: "spiritualcenter",
      name: "Spiritual Center",
      profile_image_url: "/placeholder.svg?height=100&width=100&text=Profile",
      public_metrics: {
        followers_count: 15420,
        following_count: 892,
        tweet_count: 3456,
      },
      verified: false,
    },
    tweets: [
      {
        id: "1",
        text: "Starting our day with morning meditation and prayers. May peace and wisdom guide us all on this beautiful journey. 🧘‍♀️ #MorningMeditation #Peace #Spirituality",
        created_at: "2024-01-15T06:30:00.000Z",
        public_metrics: {
          retweet_count: 45,
          like_count: 234,
          reply_count: 18,
          quote_count: 12,
        },
        author_id: "1234567890",
        attachments: {
          media_keys: ["media1"],
        },
      },
      {
        id: "2",
        text: '"The mind is everything. What you think you become." - Buddha\n\nReflecting on this timeless wisdom during our evening contemplation. #Buddha #Wisdom #Mindfulness',
        created_at: "2024-01-14T19:45:00.000Z",
        public_metrics: {
          retweet_count: 78,
          like_count: 456,
          reply_count: 32,
          quote_count: 23,
        },
        author_id: "1234567890",
      },
      {
        id: "3",
        text: "Join us this weekend for our community service initiative. Together, we can make a difference in the lives of those who need our support. 🤝 #CommunityService #Compassion",
        created_at: "2024-01-13T14:20:00.000Z",
        public_metrics: {
          retweet_count: 34,
          like_count: 189,
          reply_count: 25,
          quote_count: 8,
        },
        author_id: "1234567890",
      },
      {
        id: "4",
        text: "The lotus flower blooms most beautifully from the deepest and thickest mud. Remember this during challenging times. 🪷 #Lotus #Resilience #SpiritualWisdom",
        created_at: "2024-01-12T11:15:00.000Z",
        public_metrics: {
          retweet_count: 92,
          like_count: 567,
          reply_count: 41,
          quote_count: 28,
        },
        author_id: "1234567890",
      },
      {
        id: "5",
        text: "Grateful for our meditation group that gathered today. The energy of collective practice is truly transformative. Thank you to everyone who joined us. 🙏 #Gratitude #Meditation",
        created_at: "2024-01-11T16:30:00.000Z",
        public_metrics: {
          retweet_count: 23,
          like_count: 145,
          reply_count: 15,
          quote_count: 6,
        },
        author_id: "1234567890",
      },
      {
        id: "6",
        text: "Tonight's full moon meditation was absolutely magical. The connection between nature and spirituality never ceases to amaze us. 🌕 #FullMoon #Meditation #Nature",
        created_at: "2024-01-10T21:00:00.000Z",
        public_metrics: {
          retweet_count: 67,
          like_count: 389,
          reply_count: 28,
          quote_count: 19,
        },
        author_id: "1234567890",
      },
      {
        id: "7",
        text: 'Reading from the Bhagavad Gita: "You have the right to work, but never to the fruit of work." Profound wisdom for our modern lives. 📚 #BhagavadGita #Wisdom #SacredTexts',
        created_at: "2024-01-09T13:45:00.000Z",
        public_metrics: {
          retweet_count: 156,
          like_count: 678,
          reply_count: 52,
          quote_count: 34,
        },
        author_id: "1234567890",
      },
      {
        id: "8",
        text: "Our yoga class this morning was filled with such positive energy. Thank you to our wonderful instructor and all participants. Namaste! 🧘‍♂️ #Yoga #Namaste #Community",
        created_at: "2024-01-08T09:30:00.000Z",
        public_metrics: {
          retweet_count: 41,
          like_count: 223,
          reply_count: 19,
          quote_count: 11,
        },
        author_id: "1234567890",
      },
      {
        id: "9",
        text: "Reminder: Inner peace is not about having a perfect life. It's about finding peace within the imperfections. 🕊️ #InnerPeace #Acceptance #Mindfulness",
        created_at: "2024-01-07T15:20:00.000Z",
        public_metrics: {
          retweet_count: 89,
          like_count: 445,
          reply_count: 33,
          quote_count: 22,
        },
        author_id: "1234567890",
      },
      {
        id: "10",
        text: "Celebrating the diversity of our spiritual community. All paths that lead to love, compassion, and understanding are welcome here. ❤️ #Unity #Diversity #Love",
        created_at: "2024-01-06T12:10:00.000Z",
        public_metrics: {
          retweet_count: 73,
          like_count: 334,
          reply_count: 27,
          quote_count: 16,
        },
        author_id: "1234567890",
      },
      {
        id: "11",
        text: "Ancient wisdom teaches us that true strength comes from gentleness, and real power from compassion. Let us embody these teachings today. 💫 #AncientWisdom #Compassion #Strength",
        created_at: "2024-01-05T08:45:00.000Z",
        public_metrics: {
          retweet_count: 112,
          like_count: 523,
          reply_count: 38,
          quote_count: 25,
        },
        author_id: "1234567890",
      },
      {
        id: "12",
        text: "The sacred sound of Om resonates through our morning chanting session. Each vibration connects us deeper to the universal consciousness. 🕉️ #Om #Chanting #UniversalConsciousness",
        created_at: "2024-01-04T07:20:00.000Z",
        public_metrics: {
          retweet_count: 58,
          like_count: 298,
          reply_count: 22,
          quote_count: 14,
        },
        author_id: "1234567890",
      },
    ],
  }

  // Fetch Twitter data
  useEffect(() => {
    const fetchTwitterData = async () => {
      try {
        setLoading(true)

        // For demonstration, we'll use mock data
        // Replace this with actual Twitter API v2 calls:
        /*
        // Get user by username
        const userResponse = await fetch(`/api/twitter/user/${username}`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        })
        const userData = await userResponse.json()
        
        // Get user tweets
        const tweetsResponse = await fetch(`/api/twitter/tweets/${userData.data.id}?max_results=${limit}`, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`
          }
        })
        const tweetsData = await tweetsResponse.json()
        
        setUserProfile(userData.data)
        setTweets(tweetsData.data)
        */

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setUserProfile(mockTwitterData.user)
        setTweets(mockTwitterData.tweets.slice(0, limit))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTwitterData()
  }, [bearerToken, username, limit])

  // Handle show more tweets
  const handleShowMore = async () => {
    setLoadingMore(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Show 3 more tweets
    setVisibleTweets((prev) => Math.min(prev + 3, tweets.length))
    setLoadingMore(false)
  }

  // Handle show less tweets
  const handleShowLess = async () => {
    setLoadingMore(true)

    // Simulate loading delay for smooth UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Reset to initial 3 tweets and scroll to top of section
    setVisibleTweets(3)
    setLoadingMore(false)

    // Smooth scroll to the section header
    const section = document.querySelector('[data-section="twitter-feed"]')
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Format date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60))
      return `${diffInMinutes}m`
    } else if (diffInHours < 24) {
      return `${diffInHours}h`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d`
    }
  }

  // Format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  // Process tweet text for hashtags and mentions
  const processText = (text) => {
    return text
      .replace(/#(\w+)/g, '<span class="text-[#1DA1F2] hover:underline cursor-pointer">#$1</span>')
      .replace(/@(\w+)/g, '<span class="text-[#1DA1F2] hover:underline cursor-pointer">@$1</span>')
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-[#fcf9f5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#1DA1F2]/10 to-[#1DA1F2]/5">
              <Twitter className="text-[#1DA1F2]" size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-4">Our Twitter Journey</h2>
          </div>

          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-[#1DA1F2] animate-spin mx-auto mb-4" />
              <p className="text-[#5D4037]/70">Loading our latest thoughts...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-[#fcf9f5]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#1DA1F2]/10 to-[#1DA1F2]/5">
              <Twitter className="text-[#1DA1F2]" size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037] mb-4">Our Twitter Journey</h2>
          </div>

          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <p className="text-[#5D4037]/70 mb-4">Unable to load Twitter posts at the moment.</p>
              <p className="text-sm text-[#5D4037]/50">Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative py-16 overflow-hidden bg-gradient-to-b from-white to-[#fcf9f5]"
      data-section="twitter-feed"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1DA1F2]/0 via-[#1DA1F2]/30 to-[#1DA1F2]/0"></div>

      {/* Subtle background circles */}
      <div className="absolute -top-32 -right-32 w-64 h-64 border border-[#1DA1F2]/5 rounded-full"></div>
      <div className="absolute -bottom-32 -left-32 w-64 h-64 border border-[#1DA1F2]/5 rounded-full"></div>

      {/* Om symbol watermark */}
      <div className="absolute opacity-[0.02] text-[#1DA1F2] text-[300px] font-serif top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
        ॐ
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-[#1DA1F2]/10 to-[#1DA1F2]/5">
            <Twitter className="text-[#1DA1F2]" size={28} />
          </div>

          <h2 className="relative inline-block mb-6 text-3xl md:text-4xl font-serif text-[#5D4037] after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-gradient-to-r after:from-transparent after:via-[#1DA1F2] after:to-transparent after:bottom-0 after:left-0">
            Our Twitter Journey
          </h2>

          <p className="max-w-2xl mx-auto text-center leading-relaxed text-[#5D4037]/80">
            Follow our daily reflections, spiritual insights, and community updates shared with our global family.
          </p>
        </div>

        {/* Profile Card */}
        {userProfile && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#1DA1F2]/10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <img
                    src={userProfile.profile_image_url || "/placeholder.svg"}
                    alt={userProfile.name}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-semibold text-[#5D4037]">{userProfile.name}</h3>
                    {userProfile.verified && (
                      <div className="w-5 h-5 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[#5D4037]/60">@{userProfile.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#5D4037]">
                    {formatNumber(userProfile.public_metrics.tweet_count)}
                  </div>
                  <div className="text-sm text-[#5D4037]/60">Tweets</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#5D4037]">
                    {formatNumber(userProfile.public_metrics.followers_count)}
                  </div>
                  <div className="text-sm text-[#5D4037]/60">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#5D4037]">
                    {formatNumber(userProfile.public_metrics.following_count)}
                  </div>
                  <div className="text-sm text-[#5D4037]/60">Following</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Twitter Feed */}
        <div className="max-w-2xl mx-auto space-y-6">
          {tweets.slice(0, visibleTweets).map((tweet) => (
            <div
              key={tweet.id}
              className="group bg-white rounded-2xl p-6 shadow-lg border border-[#1DA1F2]/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Tweet Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={userProfile?.profile_image_url || "/placeholder.svg"}
                      alt={userProfile?.name || "Profile"}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-[#5D4037]">{userProfile?.name}</span>
                      {userProfile?.verified && (
                        <div className="w-4 h-4 bg-[#1DA1F2] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[#5D4037]/60 text-sm">@{userProfile?.username}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-[#5D4037]/60">
                  <Calendar size={14} />
                  <span className="text-sm">{formatDate(tweet.created_at)}</span>
                </div>
              </div>

              {/* Tweet Content */}
              <div className="mb-4">
                <p
                  className="text-[#5D4037] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: processText(tweet.text) }}
                />
              </div>

              {/* Tweet Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button className="flex items-center space-x-2 text-[#5D4037]/60 hover:text-[#1DA1F2] transition-colors group">
                    <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{formatNumber(tweet.public_metrics.reply_count)}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-[#5D4037]/60 hover:text-green-500 transition-colors group">
                    <Repeat2 size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{formatNumber(tweet.public_metrics.retweet_count)}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-[#5D4037]/60 hover:text-red-500 transition-colors group">
                    <Heart size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-sm">{formatNumber(tweet.public_metrics.like_count)}</span>
                  </button>

                  <button className="flex items-center space-x-2 text-[#5D4037]/60 hover:text-[#1DA1F2] transition-colors group">
                    <Share size={18} className="group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                <a
                  href={`https://twitter.com/${userProfile?.username}/status/${tweet.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-[#1DA1F2] hover:underline text-sm"
                >
                  View on Twitter
                  <ExternalLink size={14} className="ml-1" />
                </a>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-2 -right-2 text-[#1DA1F2]/5 text-2xl pointer-events-none select-none group-hover:text-[#1DA1F2]/10 transition-colors duration-300">
                🐦
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {tweets.length > 3 && (
          <div className="text-center mt-12">
            {visibleTweets < tweets.length ? (
              <button
                onClick={handleShowMore}
                disabled={loadingMore}
                className="inline-flex items-center px-8 py-4 bg-white text-[#1DA1F2] border-2 border-[#1DA1F2] rounded-full hover:bg-[#1DA1F2] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Loading More...
                  </>
                ) : (
                  <>
                    <Plus size={20} className="mr-2" />
                    Show More Tweets ({tweets.length - visibleTweets} remaining)
                  </>
                )}
              </button>
            ) : visibleTweets > 3 ? (
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
                      size={20}
                      className="mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 15l-6-6-6 6" />
                    </svg>
                    Show Less (showing {visibleTweets} of {tweets.length})
                  </>
                )}
              </button>
            ) : null}
          </div>
        )}

        {/* Follow Button */}
        <div className="text-center mt-12">
          <a
            href={`https://twitter.com/${userProfile?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-[#1DA1F2] text-white rounded-full hover:bg-[#1a91da] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Twitter size={20} className="mr-2" />
            Follow @{userProfile?.username}
          </a>
        </div>

      </div>

    </section>
  )
}
