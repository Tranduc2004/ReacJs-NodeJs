const Order = require("../models/Order");
const { Product } = require("../models/products");
const Cart = require("../models/cart");
const User = require("../models/user");
const mongoose = require("mongoose");
const axios = require("axios");

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

    // Tạo đơn hàng mới (đảm bảo lấy ảnh từ product)
    const newOrder = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        // Lấy ảnh đầu tiên từ mảng 'images' của product nếu có
        image:
          item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : "",
      })),
      shippingAddress,
      paymentMethod,
      note,
      totalAmount: cart.totalAmount,
    });

    // Lưu đơn hàng
    await newOrder.save();

    // Nếu là thanh toán COD, cập nhật trạng thái ngay và populate sản phẩm
    if (paymentMethod === "COD") {
      newOrder.status = "PROCESSING";
      newOrder.paymentStatus = "PENDING"; // Vẫn là pending cho COD đến khi nhận hàng
      await newOrder.save();

      // Populate thông tin sản phẩm trước khi gửi về client (THÊM 'images')
      const populatedOrder = await Order.findById(newOrder._id).populate(
        "items.product",
        "name price rating numReviews images" // Lấy mảng 'images'
      );

      // Xóa giỏ hàng
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );

      return res.status(200).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: populatedOrder,
      });
    }

    // Nếu là thanh toán MoMo
    if (paymentMethod === "MOMO") {
      // ... (chuẩn bị thông tin MoMo)

      // Lưu thông tin đơn hàng tạm thời vào Map (giữ nguyên)
      // ...

      const extraData = Buffer.from(
        JSON.stringify({
          // ... (giữ nguyên extraData)
          dbOrderId: newOrder._id.toString(), // Đảm bảo dbOrderId được truyền
        })
      ).toString("base64");

      // ... (tạo momoRequest, signature)

      // Gửi yêu cầu thanh toán đến MoMo
      const momoRes = await axios.post(momoConfig.endpoint, momoRequest);
      const momoData = momoRes.data;

      if (momoData.resultCode === 0) {
        // Cập nhật momoOrderId cho đơn hàng
        await Order.findByIdAndUpdate(newOrder._id, {
          momoOrderId: momoOrderId,
        });

        return res.status(200).json({
          success: true,
          message: "Tạo thanh toán thành công",
          data: {
            payUrl: momoData.payUrl,
            momoOrderId,
            orderId: newOrder._id, // Vẫn chỉ trả về ID
          },
        });
      } else {
        // Xóa đơn hàng nếu tạo thanh toán thất bại
        await Order.findByIdAndDelete(newOrder._id);
        pendingOrders.delete(momoOrderId);

        return res.status(400).json({
          success: false,
          message: momoData.message || "Tạo thanh toán thất bại",
        });
      }
    }

    // ... (xử lý phương thức thanh toán không hợp lệ)
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

// Kiểm tra trạng thái đơn hàng MoMo
exports.checkOrderStatus = async (req, res) => {
  try {
    const { momoOrderId } = req.params;

    // Populate thông tin sản phẩm (THÊM 'images')
    const order = await Order.findOne({ momoOrderId: momoOrderId }).populate(
      "items.product",
      "name price rating numReviews images" // Lấy mảng 'images'
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Lấy thông tin từ pendingOrders nếu có
    const pendingOrderInfo = pendingOrders.get(momoOrderId);

    // Tạo response data, đảm bảo items chứa product với images
    const responseData = {
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        product: item.product
          ? {
              _id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              rating: item.product.rating,
              numReviews: item.product.numReviews,
              // Lấy ảnh đầu tiên từ mảng images của product đã populate
              image:
                item.product.images && item.product.images.length > 0
                  ? item.product.images[0]
                  : "",
              images: item.product.images || [], // Truyền cả mảng images nếu cần
            }
          : null, // Handle case where product might not be populated (shouldn't happen here)
        name: item.name, // name đã lưu trong order item
        quantity: item.quantity,
        price: item.price, // price đã lưu trong order item
        // image: item.image // image đã lưu trong order item (ảnh đầu tiên)
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      note: order.note,
      createdAt: order.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Lấy trạng thái đơn hàng thành công",
      data: responseData,
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra trạng thái đơn hàng",
      error: error.message,
    });
  }
};
