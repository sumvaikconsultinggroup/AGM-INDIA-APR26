import  { useEffect, useRef, useState } from "react";
import { Play, X, ChevronRight, ChevronLeft, Clock, Calendar, Eye, ThumbsUp } from "lucide-react";
import axios from "axios";

const VideoSeries = () => {
  // Parallax effect for hero section
  const parallaxRef = useRef(null);
  
  // State for playlists data
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modal
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);

  useEffect(() => {
    // Parallax effect for hero section
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrollPosition = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrollPosition * 0.4}px)`;
        parallaxRef.current.style.opacity = String(1 - scrollPosition * 0.002);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch playlists data
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        
        // Use your actual API endpoint here
        const response = await axios.get(import.meta.env.VITE_APP_VIDEO_SERIES_API);
        console.log(response.data);

        if (response.data && Array.isArray(response.data.data)) {
          // Format the data to match the component's needs based on your backend data structure
          const formattedPlaylists = response.data.data.map((playlist) => ({
            id: playlist.id || playlist._id || Math.random().toString(36).substring(7),
            title: playlist.title || "Untitled Playlist",
            description: playlist.description || "No description available",
            thumbnail: playlist.thumbnail || "/placeholder.svg?height=480&width=640",
            coverImage: playlist.coverImage || null,
            category: playlist.category || "General",
            videoCount: playlist.videoCount || (playlist.videos ? playlist.videos.length : 0),
            videos: Array.isArray(playlist.videos) ? playlist.videos.map(video => ({
              id: video.videoId || video._id, // Using videoId or _id as the id
              title: video.title || "Untitled Video",
              thumbnail: video.thumbnail || video.coverImage || "/placeholder.svg?height=360&width=480",
              coverImage: video.coverImage || video.thumbnail || "/placeholder.svg?height=360&width=480",
              description: video.description || "No description available",
              duration: video.duration || "00:00",
              publishedAt: video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : "Unknown date",
              views: typeof video.views === 'number' ? 
                video.views > 1000 ? (video.views / 1000).toFixed(1) + 'K' : video.views.toString() 
                : "0",
              likes: typeof video.likes === 'number' ? 
                video.likes > 1000 ? (video.likes / 1000).toFixed(1) + 'K' : video.likes.toString() 
                : "0",
              youtubeUrl: video.youtubeUrl || `https://www.youtube.com/watch?v=${video.videoId || ""}`
            })) : []
          }));



          setPlaylists(formattedPlaylists);
        } else {
          throw new Error("Invalid data structure received from API");
        }
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
        setError("Failed to load video playlists");
        // Fall back to sample data or empty array
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaylists();
  }, []);

  const handlePlaylistClick = (playlist) => {
    setSelectedPlaylist(playlist);
    setModalOpen(true);
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setVideoPlayerOpen(false);
    setCurrentVideoId(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const handleVideoClick = (videoId) => {
    setCurrentVideoId(videoId);
    setVideoPlayerOpen(true);
  };

  const handleBackToPlaylist = () => {
    setVideoPlayerOpen(false);
    setCurrentVideoId(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcf9f5] to-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#B82A1E] mb-4"></div>
        <h2 className="text-2xl font-serif text-[#5D4037] mb-2">Loading Video Series</h2>
        <p className="text-[#5D4037]/70 text-center">Please wait while we gather spiritual videos for you...</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: "translateY(0px)",
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[#7B0000] z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif mb-4">Spiritual Video Series</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light">
            Timeless wisdom for your spiritual journey
          </p>
          <div className="mt-8 inline-block">
            <div className="h-0.5 w-20 bg-white/70 mx-auto"></div>
            <div className="h-0.5 w-12 bg-white/50 mx-auto mt-1"></div>
            <div className="h-0.5 w-6 bg-white/30 mx-auto mt-1"></div>
          </div>
        </div>

        {/* Decorative Video Icon */}
        <div className="absolute bottom-4 right-4 z-10">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white/20"
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Show error message if there was an issue loading */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error} - Showing sample data.
          </div>
        )}

        {/* Introduction with correct max-width */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="flex items-center mb-8">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">Video Teachings</h2>
          </div>

          <p className="text-[#5D4037]/80 leading-relaxed mb-4">
            Explore our collection of spiritual video series covering a wide range of topics from 
            ancient Vedic wisdom to practical meditation techniques. Each series is carefully crafted 
            to provide deep insights into spiritual principles and practices.
          </p>
          <p className="text-[#5D4037]/80 leading-relaxed">
            Whether you are a beginner on the spiritual path or an advanced seeker, these video 
            teachings offer valuable guidance for your journey to self-realization and inner peace.
          </p>
        </div>

        {/* Playlists Grid - align with the same max-width */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {playlists.map((playlist) => (
              
              <div
                key={playlist.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => handlePlaylistClick(playlist)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={playlist.coverImage || playlist.video.coverImage}
                    alt={playlist.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#B82A1E]/90 rounded-full p-3">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                    {playlist.videoCount} videos
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-serif text-[#5D4037] mb-2 group-hover:text-[#B82A1E] transition-colors">
                    {playlist.thumbnail}
                  </h3>
                  <p className="text-[#5D4037]/70 text-sm line-clamp-3 mb-4">
                    {playlist.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center text-xs text-[#5D4037]/60">
                      <Clock className="h-3 w-3 mr-1" />
                      Series
                    </span>
                    <span className="text-[#B82A1E] text-sm font-medium inline-flex items-center">
                      View Series
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Quote */}
        <div className="relative my-16 py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[#B82A1E]/5 -skew-y-2"></div>
          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <svg
              className="mx-auto text-[#B82A1E]/30 mb-6"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
            <blockquote className="text-2xl md:text-3xl font-serif text-[#5D4037] italic mb-6">
              Visual learning engages different parts of our consciousness allowing spiritual
              teachings to penetrate deeper into our being.
            </blockquote>
            <div className="h-0.5 w-20 bg-[#B82A1E]/30 mx-auto mb-4"></div>
            <p className="text-[#5D4037] font-medium">Swami Avdheshanand Giri</p>
            <p className="text-[#5D4037]/70 text-sm">Spiritual Teacher</p>
          </div>
        </div>
        
        {/* How to Use Video Teachings Section */}
        <div className="max-w-4xl mx-auto my-16">
          <div className="flex items-center mb-8">
            <div className="w-1.5 h-12 bg-gradient-to-b from-[#B82A1E] to-[#8a1f16] mr-4 rounded-full"></div>
            <h2 className="text-3xl md:text-4xl font-serif text-[#5D4037]">
              How to Use These Teachings
            </h2>
          </div>
          
          <div className="bg-[#fcf9f5] rounded-2xl p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-8 h-8 text-[#B82A1E]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                  Take Notes
                </h3>
                <p className="text-[#5D4037]/70 text-sm">
                  Keep a journal nearby to record insights that resonate with you during the videos.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-8 h-8 text-[#B82A1E]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                  Regular Practice
                </h3>
                <p className="text-[#5D4037]/70 text-sm">
                  Watch one video per day and spend time reflecting on its teachings.
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <svg
                    className="w-8 h-8 text-[#B82A1E]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-[#5D4037] mb-2">
                  Share & Discuss
                </h3>
                <p className="text-[#5D4037]/70 text-sm">
                  Form a study group to discuss the teachings and share personal insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Playlist Videos */}
      {modalOpen && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto flex flex-col">
          {/* Modal Header */}
          <div className="bg-white py-4 px-6 flex justify-between items-center shadow-md">
            <button 
              onClick={handleCloseModal}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-[#5D4037]" />
            </button>
            <h2 className="text-xl font-serif text-[#5D4037] text-center flex-1">
              {videoPlayerOpen ? "Now Playing" : selectedPlaylist.title}
            </h2>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>
          
          {/* Video Player */}
          {videoPlayerOpen && currentVideoId ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-black flex-1 flex flex-col">
                <div className="relative pt-[56.25%] w-full">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                
                {/* Video details */}
                <div className="bg-white p-6">
                  <button 
                    onClick={handleBackToPlaylist}
                    className="flex items-center text-[#B82A1E] mb-4 hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to playlist
                  </button>
                  
                  {selectedPlaylist.videos && selectedPlaylist.videos.find(v => v.id === currentVideoId) && (
                    <div>
                      <h3 className="text-2xl font-serif text-[#5D4037] mb-2">
                        {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.title}
                      </h3>
                      <div className="flex flex-wrap items-center text-[#5D4037]/60 text-sm mb-4">
                        <span className="flex items-center mr-6 mb-2">
                          <Clock className="mr-1 h-4 w-4" />
                          {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.duration}
                        </span>
                        <span className="flex items-center mr-6 mb-2">
                          <Calendar className="mr-1 h-4 w-4" />
                          {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.publishedAt}
                        </span>
                        {/* Only show views if they exist and are not "0" */}
                        {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.views && 
                         selectedPlaylist.videos.find(v => v.id === currentVideoId)?.views !== "0" && (
                          <span className="flex items-center mr-6 mb-2">
                            <Eye className="mr-1 h-4 w-4" />
                            {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.views} views
                          </span>
                        )}
                        <span className="flex items-center mb-2">
                          <ThumbsUp className="mr-1 h-4 w-4" />
                          {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.likes} likes
                        </span>
                      </div>
                      <p className="text-[#5D4037]/80 leading-relaxed">
                        {selectedPlaylist.videos.find(v => v.id === currentVideoId)?.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Playlist Videos Grid */
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              <div className="max-w-6xl mx-auto">
                <p className="text-[#5D4037]/80 mb-8">
                  {selectedPlaylist.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedPlaylist.videos && selectedPlaylist.videos.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      {/* Video Thumbnail */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={video.coverImage || video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-[#B82A1E]/90 rounded-full p-3">
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                          {video.duration}
                        </div>
                      </div>
                      
                      {/* Video Details */}
                      <div className="p-4">
                        <h3 className="font-serif text-lg text-[#5D4037] mb-2 line-clamp-2 group-hover:text-[#B82A1E] transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-[#5D4037]/70 text-sm line-clamp-2 mb-3">
                          {video.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-[#5D4037]/60">
                          <span>{video.publishedAt}</span>
                          {/* Only show views if they exist and are not "0" */}
                          {video.views && video.views !== "0" && (
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              <span>{video.views} views</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Add platform data or other constants if needed
// const platforms = [
//   {
//     name: "YouTube",
//     url: "#",
//   },
//   {
//     name: "Facebook",
//     url: "#",
//   },
// ];

export default VideoSeries;