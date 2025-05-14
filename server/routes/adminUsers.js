const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Admin = require("../models/admin");
const Order = require("../models/Order");
const ExcelJS = require("exceljs");
const jwt = require("jsonwebtoken");

// Lấy danh sách superadmin cho user (không cần quyền admin)
router.get("/superadmins", async (req, res) => {
  try {
    const superadmins = await Admin.find({
      role: "superadmin",
      isActive: true,
    }).select("name email");
    res.json({ success: true, data: superadmins });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

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

// Route xuất Excel danh sách user (phải đặt trước các route có :id)
router.get("/export", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = [
      { header: "Tên", key: "name", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Số điện thoại", key: "phone", width: 15 },
      { header: "Vai trò", key: "role", width: 10 },
      { header: "Trạng thái", key: "isActive", width: 12 },
      { header: "Ngày tạo", key: "createdAt", width: 18 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "",
        isActive: user.isActive ? "Hoạt động" : "Vô hiệu hóa",
        createdAt: user.createdAt
          ? new Date(user.createdAt).toLocaleString("vi-VN")
          : "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi khi xuất Excel:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi xuất Excel", error: error.message });
  }
});

// Lấy danh sách users với phân trang và tìm kiếm
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const role = req.query.role || "all";
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
    if (role !== "all") {
      query.role = role;
    }
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
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
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate({
        path: "orders",
        select:
          "_id totalAmount status createdAt paymentMethod discountAmount finalAmount items",
        populate: {
          path: "items.product",
          select: "name price discount images",
        },
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
        discountAmount: order.discountAmount || 0,
        finalAmount: order.finalAmount,
        status: order.status,
        createdAt: order.createdAt,
        paymentMethod: order.paymentMethod,
        items: order.items,
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
router.get("/:id/orders", async (req, res) => {
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
router.post("/", async (req, res) => {
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
router.put("/:id", async (req, res) => {
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

// Xóa user (xóa mềm: chỉ cập nhật isActive = false)
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    user.isActive = false;
    await user.save();
    res.json({ message: "Đã vô hiệu hóa tài khoản thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thay đổi trạng thái active của user
router.put("/:id/toggle-status", async (req, res) => {
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
router.get("/orders/new-count", async (req, res) => {
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
router.get("/orders/:orderId", async (req, res) => {
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
router.get("/orders", async (req, res) => {
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
router.put("/orders/:orderId/status", async (req, res) => {
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
