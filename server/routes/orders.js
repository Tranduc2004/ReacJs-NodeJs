const express = require("express");
const router = express.Router();
const {
  createOrderFromCart,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
} = require("../controllers/orderController");
const { authenticateJWT } = require("../middleware/auth");

// Tất cả các route đều yêu cầu xác thực
router.use(authenticateJWT);

// Tạo đơn hàng từ giỏ hàng
router.post("/", createOrderFromCart);

// Lấy danh sách đơn hàng của người dùng
router.get("/", getUserOrders);

// Lấy chi tiết đơn hàng
router.get("/:id", getOrderDetail);

// Hủy đơn hàng
router.put("/:id/cancel", cancelOrder);

module.exports = router;
