import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { toast } from "react-hot-toast";
import axios from "axios";

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Tự động focus vào input khi mở chat
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await api.post("/chatbot/chat", {
        message: userMessage,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { text: response.data.message, isUser: false },
        ]);
      } else {
        toast.error(response.data.message || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);

      if (error.code === "ECONNABORTED") {
        toast.error("Kết nối bị timeout, vui lòng thử lại");
      } else if (error.response) {
        // Lỗi từ server
        const errorMessage =
          error.response.data?.message || "Server lỗi, vui lòng thử lại";
        toast.error(errorMessage);
        setMessages((prev) => [...prev, { text: errorMessage, isUser: false }]);
      } else if (error.request) {
        // Không nhận được response
        toast.error("Không thể kết nối đến server, vui lòng thử lại");
      } else {
        // Lỗi khác
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        className={`fixed bottom-8 right-8 bg-[#00aaff] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 transform hover:scale-110 ${
          isOpen ? "rotate-180" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Đóng chat" : "Mở chat"}
      >
        {isOpen ? <FaTimes size={24} /> : <FaRobot size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 transform transition-all duration-300">
          {/* Chat Header */}
          <div className="bg-[#00aaff] text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FaRobot className="text-2xl animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span className="font-semibold">Trợ lý ảo</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-[#0099ee] p-2 rounded-full transition-colors"
              aria-label="Đóng chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                <FaRobot className="text-6xl text-[#00aaff]/20" />
                <p className="text-center">
                  Chào mừng bạn đến với trợ lý ảo!
                  <br />
                  Tôi có thể giúp gì cho bạn?
                </p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.isUser ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.isUser
                      ? "bg-[#00aaff] text-white"
                      : "bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-white text-gray-800 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <FaSpinner className="animate-spin text-[#00aaff]" />
                    <span>Đang tìm câu trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00aaff] focus:border-transparent"
                disabled={isLoading}
                aria-label="Nhập tin nhắn"
              />
              <button
                type="submit"
                className={`p-3 rounded-lg transition-all duration-300 ${
                  isLoading || !inputMessage.trim()
                    ? "bg-gray-300 text-gray-500"
                    : "bg-[#00aaff] text-white hover:bg-[#0099ee] hover:shadow-lg"
                }`}
                disabled={isLoading || !inputMessage.trim()}
                aria-label="Gửi tin nhắn"
              >
                <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;
