const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const { Product } = require("../models/products");
const auth = require("../middleware/auth");

// Lấy giỏ hàng của user hiện tại
router.get("/", auth, async (req, res) => {
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
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post("/add", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

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
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        // Nếu có rồi thì cập nhật số lượng
        existingItem.quantity += quantity;
      } else {
        // Nếu chưa có thì thêm mới
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }

      await cart.save();
    }

    // Populate thông tin sản phẩm trước khi trả về
    await cart.populate({
      path: "items.product",
      select: "name price images description",
    });

    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Số lượng không hợp lệ" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price images description",
    });

    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:productId", auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name price images description",
    });

    res.json(cart);
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Đã xóa toàn bộ giỏ hàng" });
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
