const express = require("express");
const router = express.Router();
const { authenticateJWT } = require("../middleware/auth");
const {
  createOrderFromCart,
  handleMomoIPN,
  checkOrderStatus,
} = require("../controllers/orderController");

// Tạo đơn hàng từ giỏ hàng
router.post("/create", authenticateJWT, createOrderFromCart);

// Xử lý IPN từ MoMo
router.post("/momo/ipn", handleMomoIPN);

// Kiểm tra trạng thái đơn hàng
router.get("/momo/status/:momoOrderId", authenticateJWT, checkOrderStatus);

module.exports = router;
