import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { sendMessage } from "../../services/api";
import ProductItem from "../ProductItem";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const res = await sendMessage(trimmed);

      // Validate response
      if (!res || typeof res !== "object") {
        throw new Error("Invalid server response");
      }

      if (res.success === false) {
        throw new Error(res.message || "Request failed");
      }

      // Construct bot message
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        timestamp: new Date(),
      };

      // Handle product responses
      if (res.isProduct) {
        botMessage.text =
          res.message || "Here are some products you might like:";

        if (res.products?.length) {
          botMessage.products = res.products.map((p) => ({
            _id: p.id || p._id,
            name: p.name,
            price: p.price,
            description: p.description,
            images: [p.image || p.images?.[0]],
            rating: p.rating || 0,
            numReviews: p.numReviews || 0,
            countInStock: p.countInStock || 1,
          }));
        } else if (res.product) {
          botMessage.product = {
            _id: res.product.id || res.product._id,
            name: res.product.name,
            price: res.product.price,
            description: res.product.description,
            images: [res.product.image || res.product.images?.[0]],
            rating: res.product.rating || 0,
            numReviews: res.product.numReviews || 0,
            countInStock: res.product.countInStock || 1,
          };
        }
      } else {
        // Handle text responses
        botMessage.text = res.message || "I couldn't understand your request.";
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chatbot error:", err);
      const errorMsg = err.message || "An unknown error occurred";

      toast.error(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: errorMsg,
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    return (
      <>
        {msg.text && (
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              mb: msg.products || msg.product ? 1 : 0,
              color: msg.isError ? "error.main" : "inherit",
            }}
          >
            {msg.text}
          </Typography>
        )}

        {msg.product && (
          <Box sx={{ mt: 1 }}>
            <ProductItem product={msg.product} itemView="list" />
          </Box>
        )}

        {msg.products && (
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
            {msg.products.map((product, idx) => (
              <ProductItem
                key={`${msg.id}-${idx}`}
                product={product}
                itemView="list"
              />
            ))}
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 50 }}>
      <IconButton
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          bgcolor: "#00aaff",
          color: "white",
          p: 3,
          "&:hover": {
            bgcolor: "#0095e0",
            transform: "scale(1.1)",
          },
          transition: "transform 0.2s",
        }}
      >
        {isOpen ? <FaTimes size={22} /> : <FaRobot size={22} />}
      </IconButton>

      {isOpen && (
        <Box
          sx={{
            position: "absolute",
            bottom: 80,
            right: 0,
            width: 360,
            height: 500,
            bgcolor: "background.paper",
            borderRadius: 1,
            boxShadow: 24,
            border: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              bgcolor: "#00aaff",
              color: "white",
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
            }}
          >
            <FaRobot size={20} style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Chat Assistant
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: "grey.50",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <Box
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    boxShadow: 1,
                    maxWidth: "80%",
                    bgcolor:
                      msg.sender === "user"
                        ? "#00aaff"
                        : msg.isError
                        ? "error.light"
                        : "background.paper",
                    color:
                      msg.sender === "user" ? "common.white" : "text.primary",
                    border: msg.sender === "bot" && !msg.isError ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  {renderMessageContent(msg)}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSend}
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type a message..."
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading}
                inputRef={inputRef}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                sx={{
                  bgcolor: "#00aaff",
                  color: "white",
                  "&:hover": { bgcolor: "#0095e0" },
                  "&.Mui-disabled": { bgcolor: "grey.300" },
                  borderRadius: 2,
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Chatbot;
