"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RotateCcw,
  Loader2,
  Heart,
  BookOpen,
  Calendar,
  Phone,
} from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "🙏 Namaste! Welcome to our spiritual center. I'm here to guide you on your journey of self-discovery. How may I assist you today?",
      timestamp: new Date(),
      suggestions: [
        "Tell me about meditation",
        "What programs do you offer?",
        "How can I visit?",
        "Spiritual guidance",
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Knowledge base for the chatbot
  const knowledgeBase = {
    meditation: {
      keywords: ["meditation", "meditate", "mindfulness", "peace", "calm", "breathe", "breathing"],
      responses: [
        "🧘‍♀️ Meditation is the cornerstone of our spiritual practice. We offer daily guided sessions at 5:30 AM and 7:00 PM. Our meditation techniques include breath awareness, mantra chanting, and silent contemplation. Would you like to know about our beginner-friendly sessions?",
        "✨ Our meditation practices are rooted in ancient Vedic traditions. We teach various techniques including Pranayama (breathing exercises), Dhyana (focused meditation), and Trataka (candle gazing). Each session begins with Om chanting to align your energy. What aspect of meditation interests you most?",
      ],
    },
    programs: {
      keywords: ["programs", "classes", "courses", "events", "activities", "schedule", "workshops"],
      responses: [
        "📅 We offer diverse spiritual programs: Daily meditation (5:30 AM & 7:00 PM), Weekly satsangs (Sundays), Yoga classes (Mon/Wed/Fri), Scripture study circles, Seasonal festivals, and Monthly retreats. We also have special programs for children and families. Which program would you like to learn more about?",
        "🎓 Our educational offerings include: Beginner meditation courses, Advanced spiritual study, Teacher training programs, Vedic philosophy classes, Sanskrit learning, and Personal spiritual counseling. All programs welcome seekers at every level. What's your current spiritual experience?",
      ],
    },
    visit: {
      keywords: ["visit", "location", "address", "hours", "directions", "where", "when", "open"],
      responses: [
        "🏛️ We're located at Juna Akhara, Haridwar, Uttarakhand, India. Our center is open daily from 5:00 AM to 9:00 PM. Visitors are always welcome! Morning meditation starts at 5:30 AM, and evening prayers begin at 7:00 PM. Would you like directions or information about upcoming events?",
        "🚪 Our doors are open to all seekers! We're situated in the sacred city of Haridwar, by the holy Ganges. The peaceful environment is perfect for spiritual practice. First-time visitors often join our evening satsang at 7:00 PM - it's a beautiful introduction to our community. Shall I tell you what to expect during your first visit?",
      ],
    },
    philosophy: {
      keywords: [
        "philosophy",
        "teaching",
        "beliefs",
        "dharma",
        "vedic",
        "spiritual",
        "wisdom",
        "truth",
      ],
      responses: [
        "🕉️ Our philosophy is rooted in Sanatan Dharma and Vedic wisdom. We believe in the unity of all existence, the divinity within every soul, and the path of self-realization through righteous living, meditation, and service. The ultimate goal is to realize our true nature as pure consciousness. What aspect of our philosophy resonates with you?",
        "📿 We follow the timeless teachings that emphasize Dharma (righteous duty), Artha (purposeful living), Kama (balanced desires), and Moksha (liberation). Our practices include the four paths of yoga: Karma (action), Bhakti (devotion), Raja (meditation), and Jnana (knowledge). Which path calls to your heart?",
      ],
    },
    om: {
      keywords: ["om", "aum", "chanting", "mantra", "sound", "vibration"],
      responses: [
        "🕉️ Om is the primordial sound, the cosmic vibration from which all creation emerges. In our practice, chanting Om helps purify the mind, align our chakras, and connect us with universal consciousness. We begin each session with Om chanting - it creates a sacred atmosphere and helps transcend the ego. Would you like to learn the proper way to chant Om?",
        "✨ The sacred syllable Om represents the three states of consciousness: A (waking), U (dreaming), M (deep sleep), and the silence after represents Turiya (pure awareness). Regular Om chanting brings inner peace, mental clarity, and spiritual awakening. Join us for our morning session to experience its transformative power!",
      ],
    },
    community: {
      keywords: ["community", "join", "family", "together", "belong", "welcome", "members"],
      responses: [
        "👥 Our spiritual family welcomes seekers from all backgrounds! Joining is simple - attend our open sessions, participate in community service, and connect with fellow practitioners. We believe in unity in diversity and support each other's spiritual growth. Everyone finds their place in our loving community. How would you like to get involved?",
        "🤝 Community is the heart of spiritual growth. We support each other through life's challenges, celebrate together during festivals, and serve humanity as one family. New members often start with our Sunday satsangs - it's a beautiful way to meet like-minded souls. What draws you to seek spiritual community?",
      ],
    },
    service: {
      keywords: ["service", "seva", "volunteer", "help", "charity", "giving", "community service"],
      responses: [
        "🙏 Seva (selfless service) is fundamental to spiritual growth. We regularly serve through feeding programs, healthcare initiatives, education support, and environmental conservation. Service purifies the heart and dissolves ego. Our volunteers find deep fulfillment in giving back. What type of service resonates with your heart?",
        "❤️ Through seva, we put our spiritual understanding into action. We operate food kitchens, support orphanages, provide medical aid, and teach underprivileged children. Service is worship in action - it transforms both the giver and receiver. Would you like to join our next community service project?",
      ],
    },
    contact: {
      keywords: ["contact", "phone", "email", "reach", "call", "message", "speak"],
      responses: [
        "📞 You can reach us at: Email: info@swamiavdheshanand.org, Phone: +91 XXXXX XXXXX. Our spiritual guides are available for personal consultations by appointment. We also offer online sessions for distant seekers. How would you prefer to connect with us?",
        "💌 We're here to support your spiritual journey! Contact us via email for program information, call for urgent matters, or visit us in person for the full experience. Our doors and hearts are always open to sincere seekers. What specific guidance are you seeking?",
      ],
    },
  };

  // Quick action buttons
  const quickActions = [
    {
      icon: <Heart size={16} />,
      text: "Meditation Guide",
      action: "Tell me about meditation practices",
    },
    { icon: <BookOpen size={16} />, text: "Our Programs", action: "What programs do you offer?" },
    { icon: <Calendar size={16} />, text: "Visit Us", action: "How can I visit your center?" },
    { icon: <Phone size={16} />, text: "Contact Info", action: "How can I contact you?" },
  ];

  // Generate bot response based on user input
  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Find matching knowledge base entry
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some((keyword) => input.includes(keyword))) {
        const randomResponse = data.responses[Math.floor(Math.random() * data.responses.length)];
        return {
          content: randomResponse,
          suggestions: getSuggestions(category),
        };
      }
    }

    // Default responses for unmatched queries
    const defaultResponses = [
      {
        content:
          "🤔 That's a thoughtful question! While I may not have a specific answer, our spiritual guides would love to discuss this with you personally. You can reach them at info@swamiavdheshanand.org or visit us during our open hours. Is there something else I can help you with?",
        suggestions: [
          "Tell me about meditation",
          "What are your programs?",
          "How can I visit?",
          "Contact information",
        ],
      },
      {
        content:
          "🙏 Thank you for your question. Our spiritual teachings cover many profound topics that are best explored in person with our experienced guides. I encourage you to join our evening satsang at 7:00 PM for deeper discussions. What other aspects of our spiritual center interest you?",
        suggestions: [
          "Meditation practices",
          "Community programs",
          "Visiting hours",
          "Spiritual guidance",
        ],
      },
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // Get contextual suggestions
  const getSuggestions = (category) => {
    const suggestionMap = {
      meditation: [
        "Different meditation techniques",
        "Meditation schedule",
        "Beginner tips",
        "Advanced practices",
      ],
      programs: ["Class schedules", "Registration process", "Program fees", "Online options"],
      visit: ["Directions to center", "What to bring", "Parking information", "First visit guide"],
      philosophy: ["Sacred texts", "Spiritual practices", "Teacher lineage", "Core beliefs"],
      om: ["Chanting techniques", "Om meditation", "Sound healing", "Mantra practice"],
      community: ["How to join", "Community events", "Volunteer opportunities", "Member benefits"],
      service: ["Current projects", "How to volunteer", "Service schedule", "Impact stories"],
      contact: ["Schedule consultation", "Online programs", "Emergency contact", "Social media"],
    };
    return (
      suggestionMap[category] || [
        "Tell me more",
        "Other programs",
        "Visit information",
        "Contact details",
      ]
    );
  };

  // Handle sending message
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Call your backend API route
      const res = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/chat-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: data.reply || "🙏 Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
        suggestions: data.suggestions || [
          "Tell me about meditation",
          "What programs do you offer?",
          "How can I visit?",
          "Contact information",
        ],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "⚠️ Something went wrong while connecting to our guide. Please try again later.",
        timestamp: new Date(),
        suggestions: [
          "Meditation practices",
          "Community programs",
          "Visiting hours",
          "Contact information",
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);

      // Update unread count if chat is closed
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Reset conversation
  const resetConversation = () => {
    setMessages([
      {
        id: 1,
        type: "bot",
        content:
          "🙏 Namaste! I'm here to guide you on your spiritual journey. How may I assist you today?",
        timestamp: new Date(),
        suggestions: [
          "Tell me about meditation",
          "What programs do you offer?",
          "How can I visit?",
          "Spiritual guidance",
        ],
      },
    ]);
  };

  // Open chat and clear unread count
  const openChat = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={openChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-[#B82A1E] to-[#8a1f16] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
        >
          <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </div>
          )}

          {/* Floating animation rings */}
          <div className="absolute inset-0 rounded-full border-2 border-[#B82A1E]/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border border-[#B82A1E]/20 animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#B82A1E]/20 transition-all duration-300 ${
            isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#B82A1E] to-[#8a1f16] text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🕉️</span>
              </div>
              <div>
                <h3 className="font-semibold">Spiritual Guide</h3>
                <p className="text-xs opacity-90">Always here to help</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={resetConversation}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Reset conversation"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(action.action)}
                      className="flex items-center space-x-2 p-2 text-sm bg-[#fcf9f5] hover:bg-[#B82A1E]/10 rounded-lg transition-colors text-[#5D4037]"
                    >
                      {action.icon}
                      <span>{action.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}
                    >
                      <div
                        className={`flex items-start space-x-2 ${
                          message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === "user"
                              ? "bg-[#B82A1E] text-white"
                              : "bg-gradient-to-br from-[#B82A1E]/10 to-[#B82A1E]/5 text-[#B82A1E]"
                          }`}
                        >
                          {message.type === "user" ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div
                          className={`rounded-2xl p-3 ${
                            message.type === "user"
                              ? "bg-[#B82A1E] text-white rounded-br-md"
                              : "bg-[#fcf9f5] text-[#5D4037] rounded-bl-md border border-[#B82A1E]/10"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.type === "user" ? "text-white/70" : "text-[#5D4037]/50"
                            }`}
                          >
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>

                      {/* Suggestions */}
                      {message.type === "bot" && message.suggestions && (
                        <div className="mt-3 ml-10 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs p-2 bg-white border border-[#B82A1E]/20 rounded-lg hover:bg-[#B82A1E]/5 transition-colors text-[#5D4037]"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B82A1E]/10 to-[#B82A1E]/5 text-[#B82A1E] flex items-center justify-center">
                        <Bot size={16} />
                      </div>
                      <div className="bg-[#fcf9f5] rounded-2xl rounded-bl-md p-3 border border-[#B82A1E]/10">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-[#B82A1E]/50 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-[#B82A1E]/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-[#B82A1E]/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Ask about meditation, programs, or spiritual guidance..."
                    className="flex-1 p-3 border border-[#B82A1E]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B82A1E]/20 focus:border-[#B82A1E] text-[#5D4037] placeholder-[#5D4037]/50"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="p-3 bg-[#B82A1E] text-white rounded-xl hover:bg-[#a32519] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>

                <p className="text-xs text-[#5D4037]/50 mt-2 text-center">
                  Powered by spiritual wisdom • Always here to guide you 🙏
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
