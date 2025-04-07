const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user với id từ token
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    // Thêm thông tin user và token vào request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Vui lòng đăng nhập" });
  }
};

module.exports = auth;
