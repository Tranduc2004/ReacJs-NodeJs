const express = require("express");
// mergeParams: true cho phép router này truy cập các tham số từ router cha (ví dụ: :productId)
const router = express.Router({ mergeParams: true });
const ProductLike = require("../models/ProductLike");
const { Product } = require("../models/products.js"); // Sửa lại cách import
const { authenticateJWT } = require("../middleware/auth");

/**
 * @route   GET /api/products/:productId/like
 * @desc    Kiểm tra trạng thái yêu thích
 * @access  Private (yêu cầu đăng nhập)
 */
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    console.log("Kiểm tra trạng thái yêu thích:", { productId, userId });

    const like = await ProductLike.findOne({
      user: userId,
      product: productId,
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/products/:productId/like
 * @desc    Thêm vào danh sách yêu thích
 * @access  Private (yêu cầu đăng nhập)
 */
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    console.log("Thêm vào danh sách yêu thích:", { productId, userId });

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Không tìm thấy sản phẩm:", productId);
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Kiểm tra đã thích chưa
    const existingLike = await ProductLike.findOne({
      user: userId,
      product: productId,
    });

    if (existingLike) {
      console.log("Đã thích sản phẩm này rồi");
      return res.status(400).json({ message: "Bạn đã thích sản phẩm này rồi" });
    }

    // Tạo lượt thích mới
    const newLike = new ProductLike({
      user: userId,
      product: productId,
    });

    await newLike.save();
    console.log("Đã thêm vào danh sách yêu thích thành công");
    res.status(201).json({
      message: "Đã thêm vào danh sách yêu thích",
      like: newLike,
    });
  } catch (error) {
    console.error("Lỗi khi thêm vào danh sách yêu thích:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Bạn đã thích sản phẩm này rồi" });
    }
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
});

/**
 * @route   DELETE /api/products/:productId/like
 * @desc    Xóa khỏi danh sách yêu thích
 * @access  Private (yêu cầu đăng nhập)
 */
router.delete("/", authenticateJWT, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user.id;

    console.log("Xóa khỏi danh sách yêu thích:", { productId, userId });

    const result = await ProductLike.findOneAndDelete({
      user: userId,
      product: productId,
    });

    if (!result) {
      console.log("Không tìm thấy lượt thích để xóa");
      return res.status(404).json({ message: "Không tìm thấy lượt thích" });
    }

    console.log("Đã xóa khỏi danh sách yêu thích thành công");
    res.json({ message: "Đã xóa khỏi danh sách yêu thích" });
  } catch (error) {
    console.error("Lỗi khi xóa khỏi danh sách yêu thích:", error);
    res.status(500).json({
      message: "Lỗi máy chủ nội bộ",
      error: error.message,
    });
  }
});

module.exports = router;
