const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { authenticateJWT } = require("../middleware/auth");

// Lấy danh sách users với phân trang và tìm kiếm
router.get("/users", authenticateJWT, async (req, res) => {
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
router.get("/users/:id", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Tạo user mới
router.post("/users", authenticateJWT, async (req, res) => {
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
router.put("/users/:id", authenticateJWT, async (req, res) => {
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
router.delete("/users/:id", authenticateJWT, async (req, res) => {
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
router.put("/users/:id/toggle-status", authenticateJWT, async (req, res) => {
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

module.exports = router;
