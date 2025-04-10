const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Bạn cần đăng nhập để thực hiện thao tác này",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền thực hiện thao tác này",
    });
  }

  next();
};

module.exports = admin;
