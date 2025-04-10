const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const { protect } = require("../middleware/jwt");
const mongoose = require("mongoose");

// Lấy tất cả reviews của một sản phẩm
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort("-date");

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đánh giá",
      error: error.message,
    });
  }
});

// Thêm review mới
router.post("/", protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Kiểm tra xem user đã review sản phẩm này chưa
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này rồi",
      });
    }

    const review = new Review({
      user: req.user.id,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    // Populate user info before sending response
    await review.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Đánh giá đã được thêm thành công",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể thêm đánh giá",
      error: error.message,
    });
  }
});

// Cập nhật review
router.put("/:id", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra xem user có quyền sửa review này không
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đánh giá này",
      });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    res.json({
      success: true,
      message: "Đánh giá đã được cập nhật",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể cập nhật đánh giá",
      error: error.message,
    });
  }
});

// Xóa review
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra xem user có quyền xóa review này không
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    await review.remove();

    res.json({
      success: true,
      message: "Đánh giá đã được xóa",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa đánh giá",
      error: error.message,
    });
  }
});

module.exports = router;
