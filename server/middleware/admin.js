const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Không có quyền truy cập, yêu cầu quyền admin",
    });
  }
};

module.exports = admin;
