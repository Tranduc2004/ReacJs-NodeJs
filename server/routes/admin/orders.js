const express = require("express");
const router = express.Router();
const Order = require("../../models/Order");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

// Middleware xác thực admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Kiểm tra xem token có phải của admin không
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

// Tất cả các route đều yêu cầu xác thực admin
router.use(authenticateAdmin);

// Lấy danh sách tất cả đơn hàng
router.get("/", async (req, res) => {
  try {
    console.log("Bắt đầu lấy danh sách đơn hàng...");
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price discount images")
      .sort({ createdAt: -1 });
    console.log("Số lượng đơn hàng:", orders.length);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Đếm số đơn hàng mới (trạng thái pending)
router.get("/new-count", async (req, res) => {
  try {
    console.log("Bắt đầu đếm số đơn hàng mới...");
    console.log("Admin:", req.admin);

    const count = await Order.countDocuments({ status: "pending" });
    console.log("Số đơn hàng mới:", count);

    if (count === null || count === undefined) {
      throw new Error("Kết quả đếm không hợp lệ");
    }

    res.json({ success: true, count });
  } catch (error) {
    console.error("Lỗi khi đếm số đơn hàng mới:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.status = status;
    if (note) {
      order.notes = order.notes || [];
      order.notes.push({
        status,
        note,
        updatedBy: req.admin.id,
        updatedAt: new Date(),
      });
    }

    await order.save();
    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy chi tiết đơn hàng
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price discount image images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Thêm route lấy chi tiết user kèm lịch sử đơn hàng cho admin
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy user" });
    }
    // Lấy danh sách đơn hàng của user này
    const orders = await Order.find({ user: user._id })
      .populate("items.product", "name price discount images")
      .sort({ createdAt: -1 });
    user.orders = orders;
    res.json({ success: true, data: user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
