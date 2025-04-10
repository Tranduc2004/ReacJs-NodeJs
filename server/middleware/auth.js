const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token received:", token); // Debug token

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug decoded token

    const user = await User.findById(decoded.id).select("-password");
    console.log("User found:", user); // Debug user

    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    req.user = user;
    req.token = token; // Include this if you need it
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = auth;
