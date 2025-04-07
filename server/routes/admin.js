const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Middleware xác thực JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token xác thực" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Route đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username });

    // Kiểm tra username
    const admin = await Admin.findOne({ username });
    console.log("Found admin:", admin ? "Yes" : "No");

    if (!admin) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });
    }

    // Kiểm tra trạng thái tài khoản
    if (!admin.isActive) {
      return res.status(401).json({ message: "Tài khoản đã bị vô hiệu hóa" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await admin.comparePassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        username: admin.username,
        role: admin.role,
      },
      process.env.JWT_SECRET || "your_jwt_secret_key_here",
      { expiresIn: "24h" }
    );

    // Cập nhật thời gian đăng nhập cuối
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Route đăng ký admin
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Kiểm tra xem đã có admin nào chưa
    const adminCount = await Admin.countDocuments();

    // Nếu đã có admin và không có token superadmin
    if (adminCount > 0) {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res
          .status(401)
          .json({ message: "Không có quyền tạo tài khoản admin mới" });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "superadmin") {
          return res
            .status(403)
            .json({ message: "Chỉ superadmin mới có quyền tạo admin mới" });
        }
      } catch (error) {
        return res.status(401).json({ message: "Token không hợp lệ" });
      }
    }

    // Kiểm tra username và email đã tồn tại
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Username hoặc email đã được sử dụng",
      });
    }

    // Tạo admin mới
    const newAdmin = new Admin({
      username,
      email,
      password,
      fullName,
      role: adminCount === 0 ? "superadmin" : role || "admin", // Admin đầu tiên luôn là superadmin
      isActive: true,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Tạo tài khoản admin thành công",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Lỗi tạo tài khoản admin:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route kiểm tra thông tin admin hiện tại
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Không tìm thấy admin" });
    }
    res.json(admin);
  } catch (error) {
    console.error("Lỗi lấy thông tin admin:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route đổi mật khẩu
router.post("/change-password", authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Mật khẩu hiện tại không chính xác" });
    }

    // Cập nhật mật khẩu mới
    admin.password = newPassword;
    await admin.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route đăng xuất
router.post("/logout", authenticateJWT, async (req, res) => {
  try {
    res.json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route kiểm tra admin đầu tiên
router.get("/check-first", async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ isFirst: adminCount === 0 });
  } catch (error) {
    console.error("Lỗi kiểm tra admin đầu tiên:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
