const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Không tìm thấy token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      _id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error("Lỗi xác thực token:", error);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

const isAdmin = (req, res, next) => {
  console.log("User role:", req.user?.role);
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }

  // Kiểm tra role không phân biệt chữ hoa chữ thường
  const userRole = req.user.role.toLowerCase();
  if (userRole !== "admin" && userRole !== "superadmin") {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  next();
};

module.exports = { authenticateJWT, isAdmin };
