const Order = require("../models/Order");
const Product = require("../models/products");
const Cart = require("../models/cart");
const mongoose = require("mongoose");

// Tạo đơn hàng từ giỏ hàng
exports.createOrderFromCart = async (req, res) => {
  try {
    // Kiểm tra user
    if (!req.user || !req.user._id) {
      console.error("Không tìm thấy thông tin người dùng");
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
        error: "Unauthorized",
      });
    }

    const { shippingAddress, paymentMethod, note } = req.body;
    const userId = req.user._id;

    console.log("Request body:", req.body);

    // Validate dữ liệu đầu vào
    if (!shippingAddress || !paymentMethod) {
      console.error("Thiếu thông tin bắt buộc:", {
        shippingAddress,
        paymentMethod,
      });
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
        error: "Missing required fields",
      });
    }

    // Lấy giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      console.error("Giỏ hàng trống:", { userId });
      return res.status(400).json({
        success: false,
        message: "Giỏ hàng trống",
        error: "Cart is empty",
      });
    }

    console.log("Cart items:", cart.items);

    // Kiểm tra số lượng sản phẩm còn trong kho
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        console.error("Sản phẩm không tồn tại:", {
          productId: item.product._id,
        });
        return res.status(400).json({
          success: false,
          message: `Sản phẩm không tồn tại`,
          error: "Product not found",
        });
      }
      if (product.countInStock < item.quantity) {
        console.error("Không đủ số lượng trong kho:", {
          productId: item.product._id,
          requested: item.quantity,
          available: product.countInStock,
        });
        return res.status(400).json({
          success: false,
          message: `Sản phẩm ${product.name} không đủ số lượng trong kho`,
          error: "Insufficient stock",
        });
      }
    }

    // Tính tổng tiền
    const totalAmount = cart.items.reduce(
      (total, item) => total + item.quantity * item.product.price,
      0
    );

    console.log("Total amount:", totalAmount);

    // Tạo đơn hàng mới
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      shippingAddress,
      paymentMethod,
      totalAmount,
      note,
      status: "pending",
    });

    console.log("New order:", order);

    // Lưu đơn hàng
    await order.save();

    // Cập nhật số lượng tồn kho
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { countInStock: -item.quantity },
      });
    }

    // Xóa giỏ hàng
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh sách đơn hàng của người dùng
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", {
      message: error.message,
      stack: error.stack,
      userId: req.user._id,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy chi tiết đơn hàng
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
      userId: req.user._id,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    // Chỉ cho phép hủy đơn hàng ở trạng thái pending
    if (order.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng ở trạng thái này",
      });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    await order.save();

    // Hoàn trả số lượng sản phẩm vào kho
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: "Đơn hàng đã được hủy thành công",
    });
  } catch (error) {
    console.error("Lỗi khi hủy đơn hàng:", {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
      userId: req.user._id,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
