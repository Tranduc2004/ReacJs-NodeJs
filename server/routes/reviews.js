const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const { authenticateJWT } = require("../middleware/auth");
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
router.post("/", authenticateJWT, async (req, res) => {
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

    res.status(201).json({
      success: true,
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
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền cập nhật đánh giá này",
      });
    }

    review.rating = rating;
    review.comment = comment;

    await review.save();

    res.json({
      success: true,
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
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra quyền sở hữu
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    await review.remove();

    res.json({
      success: true,
      data: {},
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
