import { useState, useRef, useEffect } from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { getChatGPTResponse } from "../utils/openai";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = { type: "user", text: inputText.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Simulate a small delay for more natural conversation flow
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get response from GPT or fallback system
      const response = await getChatGPTResponse([...messages, userMessage]);
      setMessages((prev) => [...prev, { type: "bot", text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "I apologize, but I'm having trouble at the moment. Please try again later.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  //   const getBotResponse = (input) => {
  //     // Simple response logic
  //     if (input.includes("hello") || input.includes("hi")) {
  //       return "Hello! How can I assist you today?";
  //     }
  //     if (input.includes("book") || input.includes("books")) {
  //       return "We have a great collection of books. You can browse them on our home page. Would you like me to help you find something specific?";
  //     }
  //     if (input.includes("login") || input.includes("sign")) {
  //       return "You can login using the login button in the top right corner. The demo credentials are: email: user@example.com, password: password123";
  //     }
  //     if (input.includes("language") || input.includes("translate")) {
  //       return "You can change the language between English and Hindi using the language selector in the navigation bar.";
  //     }
  //     if (input.includes("profile")) {
  //       return "You can access and edit your profile by clicking on your profile icon in the top right corner after logging in.";
  //     }
  //     return "I'm not sure about that. Can you please rephrase your question?";
  //   };

  return (
    <div className="fixed bottom-4 right-4 z-50 ">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#B82A1E] text-white rounded-full p-4 shadow-lg hover:bg-orange-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 max-w-full flex flex-col h-[500px]">
          {/* Header */}
          <div className="p-4 bg-orange-500 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">Chat Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-orange-500 text-white rounded-lg px-4 py-2 hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
