const express = require("express");
const router = express.Router();
const Footer = require("../models/Footer");
const { authenticateJWT } = require("../middleware/auth");
const admin = require("../middleware/admin");

// Lấy thông tin footer
router.get("/", async (req, res) => {
  try {
    const footer = await Footer.findOne({ isActive: true });
    res.json({
      success: true,
      data: footer || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Tạo footer mới (chỉ admin)
router.post("/", authenticateJWT, admin, async (req, res) => {
  try {
    // Kiểm tra xem đã có footer active chưa
    const existingFooter = await Footer.findOne({ isActive: true });
    if (existingFooter) {
      return res.status(400).json({
        success: false,
        message: "Đã tồn tại footer active, vui lòng cập nhật footer hiện tại",
      });
    }

    const footer = new Footer(req.body);
    await footer.save();
    res.status(201).json({
      success: true,
      data: footer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Cập nhật footer (chỉ admin)
router.put("/:id", authenticateJWT, admin, async (req, res) => {
  try {
    const footer = await Footer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isActive: true },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy footer",
      });
    }
    res.json({
      success: true,
      data: footer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Xóa footer (chỉ admin)
router.delete("/:id", authenticateJWT, admin, async (req, res) => {
  try {
    const footer = await Footer.findByIdAndDelete(req.params.id);
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy footer",
      });
    }
    res.json({
      success: true,
      message: "Xóa footer thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
});

module.exports = router;
