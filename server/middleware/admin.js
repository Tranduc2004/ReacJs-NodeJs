const admin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Không có quyền truy cập, yêu cầu quyền admin hoặc superadmin",
    });
  }
};

module.exports = admin;
