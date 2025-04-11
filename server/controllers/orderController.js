const Order = require("../models/Order");
const { Product } = require("../models/products");
const Cart = require("../models/cart");
const User = require("../models/user");
const mongoose = require("mongoose");

// Tạo đơn hàng từ giỏ hàng
exports.createOrderFromCart = async (req, res) => {
  try {
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Kiểm tra user
    if (!req.user || !req.user.id) {
      console.error("Không tìm thấy thông tin người dùng");
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để tiếp tục",
        error: "Unauthorized",
      });
    }

    const { shippingAddress, paymentMethod, note } = req.body;

    // Kiểm tra dữ liệu đầu vào
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

    // Kiểm tra định dạng shippingAddress
    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.district ||
      !shippingAddress.ward
    ) {
      console.error("Thiếu thông tin địa chỉ:", shippingAddress);
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ thông tin địa chỉ",
        error: "Invalid shipping address",
      });
    }

    // Chuyển đổi userId thành ObjectId
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.id);
    } catch (error) {
      console.error("Lỗi khi chuyển đổi userId:", error);
      return res.status(400).json({
        success: false,
        message: "ID người dùng không hợp lệ",
        error: "Invalid user ID",
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

    console.log("Cart items:", JSON.stringify(cart.items, null, 2));

    // Kiểm tra số lượng sản phẩm còn trong kho
    for (const item of cart.items) {
      console.log("Kiểm tra sản phẩm:", item.product._id);
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

    // Tạo đơn hàng mới
    const order = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image:
          item.product.image ||
          (item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : ""),
        images: item.product.images || [],
      })),
      shippingAddress,
      paymentMethod,
      note,
      totalAmount: cart.totalAmount,
    });

    // Lưu đơn hàng
    const savedOrder = await order.save();

    // Cập nhật orders trong User model
    await User.findByIdAndUpdate(userId, {
      $push: { orders: savedOrder._id },
    });

    // Cập nhật số lượng sản phẩm trong kho
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { countInStock: -item.quantity },
      });
    }

    // Xóa giỏ hàng
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: savedOrder,
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
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
    const orders = await Order.find({ user: req.user.id })
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
      userId: req.user.id,
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
      .populate("items.product", "name price image images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Kiểm tra quyền truy cập
    if (order.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    // Log để debug
    console.log("Order data:", JSON.stringify(order, null, 2));

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đơn hàng:", {
      message: error.message,
      stack: error.stack,
      orderId: req.params.id,
      userId: req.user.id,
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
    if (order.user.toString() !== req.user.id.toString()) {
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
      userId: req.user.id,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
