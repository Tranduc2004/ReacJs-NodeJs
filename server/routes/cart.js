const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const { Product } = require("../models/products");
const { authenticateJWT } = require("../middleware/auth");

// Lấy giỏ hàng của user hiện tại
router.get("/", authenticateJWT, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "name price images description",
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm hoặc số lượng" });
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
      });
    } else {
      // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Nếu đã có, cập nhật số lượng
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Nếu chưa có, thêm mới
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/update", authenticateJWT, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin sản phẩm hoặc số lượng" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:productId", authenticateJWT, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete("/clear", authenticateJWT, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
