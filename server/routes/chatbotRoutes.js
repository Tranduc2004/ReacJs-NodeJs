const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatbotController");

// Route cho chatbot
router.post("/chat", chat);

// Xử lý lỗi cho route này
router.use((err, req, res, next) => {
  console.error("Lỗi trong chatbot route:", err);
  res.status(500).json({
    success: false,
    message: "Có lỗi xảy ra trong chatbot",
    error: err.message,
  });
});

module.exports = router;
