const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateJWT } = require("../middleware/auth");
const Order = require("../models/Order");

// Lấy danh sách users với phân trang và tìm kiếm
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Tạo query tìm kiếm
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Lấy tổng số users
    const total = await User.countDocuments(query);

    // Lấy danh sách users
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy thông tin chi tiết user
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "orders",
        select: "_id totalAmount status createdAt paymentMethod",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Format lại dữ liệu đơn hàng
    const formattedUser = {
      ...user.toObject(),
      orders: user.orders.map((order) => ({
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
      })),
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy lịch sử đơn hàng của user
router.get("/:id/orders", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const orders = await Order.find({ user: req.params.id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Tạo user mới
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || "user",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Lỗi khi tạo user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật thông tin user
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra email mới có trùng với email của user khác không
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email đã được sử dụng" });
      }
    }

    // Cập nhật thông tin
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa user
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    await user.remove();
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thay đổi trạng thái active của user
router.put("/:id/toggle-status", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Đã ${
        user.isActive ? "kích hoạt" : "vô hiệu hóa"
      } tài khoản thành công`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy số đơn hàng mới (trong 24h)
router.get("/orders/new-count", authenticateJWT, async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const newOrdersCount = await Order.countDocuments({
      createdAt: { $gte: oneDayAgo },
      status: "pending",
    });

    res.json({
      success: true,
      count: newOrdersCount,
    });
  } catch (error) {
    console.error("Lỗi khi lấy số đơn hàng mới:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy số đơn hàng mới",
      error: error.message,
    });
  }
});

// Lấy chi tiết đơn hàng
router.get("/orders/:orderId", authenticateJWT, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate({
        path: "items.product",
        select: "name price images",
        model: "Product",
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy chi tiết đơn hàng",
      error: error.message,
    });
  }
});

// Lấy tất cả đơn hàng
router.get("/orders", authenticateJWT, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
});

// Cập nhật trạng thái đơn hàng
router.put("/orders/:orderId/status", authenticateJWT, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Cập nhật trạng thái và ghi chú
    order.status = status;
    if (note) {
      order.notes = order.notes || [];
      order.notes.push({
        status,
        note,
        updatedAt: new Date(),
      });
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
});

module.exports = router;
