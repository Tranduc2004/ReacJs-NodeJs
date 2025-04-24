const Order = require("../models/Order");
const { Product } = require("../models/products");
const Cart = require("../models/cart");
const User = require("../models/user");
const mongoose = require("mongoose");
const axios = require("axios");
const crypto = require("crypto");

// Cấu hình MoMo Test
const momoConfig = {
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  redirectUrl: "http://localhost:3001/thank-you",
  ipnUrl: "http://localhost:4000/api/orders/momo/ipn",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  requestType: "captureWallet",
};

// Tạo chữ ký MoMo
const generateSignature = (data) => {
  const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
  return crypto
    .createHmac("sha256", momoConfig.secretKey)
    .update(rawSignature)
    .digest("hex");
};

// Tạo Map để lưu trữ thông tin đơn hàng tạm thời
const pendingOrders = new Map();

// Tạo đơn hàng từ giỏ hàng
const createOrderFromCart = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod, note } =
      req.body;

    // Kiểm tra thông tin bắt buộc
    if (!items || !totalAmount || !shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
        missingFields: {
          items: !items,
          totalAmount: !totalAmount,
          shippingAddress: !shippingAddress,
          paymentMethod: !paymentMethod,
        },
      });
    }

    // Chuẩn bị items cho đơn hàng
    const orderItems = items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    // Tạo đơn hàng mới
    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: "PENDING",
      paymentStatus: "PENDING",
      note: note || "",
    });

    // Lưu đơn hàng
    await newOrder.save();

    // Nếu là thanh toán COD, cập nhật trạng thái ngay
    if (paymentMethod === "COD") {
      newOrder.status = "PROCESSING";
      newOrder.paymentStatus = "PENDING";
      await newOrder.save();

      // Xóa giỏ hàng
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );

      return res.status(200).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: newOrder,
      });
    }

    // Nếu là thanh toán MoMo
    if (paymentMethod === "MOMO") {
      // Chuẩn bị thông tin gửi đến MoMo
      const requestId = `REQ${Date.now()}`;
      const momoOrderId = `${momoConfig.partnerCode}${Date.now()}`;

      // Lưu thông tin đơn hàng tạm thời vào Map
      pendingOrders.set(momoOrderId, {
        orderId: newOrder._id.toString(),
        userId: req.user._id.toString(),
      });

      const extraData = Buffer.from(
        JSON.stringify({
          orderId: momoOrderId,
          userId: req.user._id.toString(),
          dbOrderId: newOrder._id.toString(),
        })
      ).toString("base64");

      const momoRequest = {
        partnerCode: momoConfig.partnerCode,
        partnerName: "Test",
        storeId: "MomoTestStore",
        requestId,
        amount: totalAmount,
        orderId: momoOrderId,
        orderInfo: `Thanh toán đơn hàng ${momoOrderId}`,
        redirectUrl: momoConfig.redirectUrl,
        ipnUrl: momoConfig.ipnUrl,
        lang: "vi",
        requestType: momoConfig.requestType,
        extraData,
      };

      momoRequest.signature = generateSignature(momoRequest);

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
            orderId: newOrder._id,
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

    return res.status(400).json({
      success: false,
      message: "Phương thức thanh toán không hợp lệ",
    });
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo đơn hàng",
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

// Xử lý IPN từ MoMo
const handleMomoIPN = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // Tạo lại chữ ký để so sánh
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const calculatedSignature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== calculatedSignature) {
      return res.status(400).json({ message: "Chữ ký không hợp lệ" });
    }

    // Giải mã extraData để lấy thông tin
    const parsedExtra = JSON.parse(Buffer.from(extraData, "base64").toString());
    const { userId, dbOrderId } = parsedExtra;

    // Lấy thông tin đơn hàng tạm thời
    const pendingOrder = pendingOrders.get(orderId);
    if (!pendingOrder) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin đơn hàng" });
    }

    // Kiểm tra resultCode
    if (parseInt(resultCode) === 0) {
      // Thanh toán thành công
      try {
        // Tìm đơn hàng trong database
        const order = await Order.findById(dbOrderId);
        if (!order) {
          throw new Error("Không tìm thấy đơn hàng để cập nhật");
        }

        // Cập nhật đơn hàng
        order.status = "PROCESSING";
        order.paymentStatus = "PAID";
        order.momoTransactionId = transId;
        order.paidAt = new Date();
        await order.save();

        // Xóa giỏ hàng
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        // Xóa thông tin đơn hàng tạm thời
        pendingOrders.delete(orderId);

        return res.status(200).json({
          success: true,
          message: "Đã xử lý thành công",
          data: {
            orderId: order._id,
            paymentStatus: "PAID",
            status: "PROCESSING",
            momoTransactionId: transId,
          },
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi cập nhật đơn hàng",
          error: error.message,
        });
      }
    } else if (parseInt(resultCode) === 1006) {
      // Người dùng hủy thanh toán
      try {
        const order = await Order.findById(dbOrderId);
        if (order) {
          order.status = "CANCELLED";
          order.paymentStatus = "CANCELLED";
          await order.save();
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái hủy:", error);
      }

      pendingOrders.delete(orderId);
      return res.status(200).json({
        success: true,
        message: "Người dùng đã hủy thanh toán",
        data: {
          paymentStatus: "CANCELLED",
          status: "CANCELLED",
        },
      });
    } else {
      // Thanh toán thất bại vì lý do khác
      try {
        const order = await Order.findById(dbOrderId);
        if (order) {
          order.status = "FAILED";
          order.paymentStatus = "FAILED";
          await order.save();
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái thất bại:", error);
      }

      pendingOrders.delete(orderId);
      return res.status(200).json({
        success: true,
        message: "Thanh toán thất bại",
        data: {
          error: message,
          resultCode,
          paymentStatus: "FAILED",
          status: "FAILED",
        },
      });
    }
  } catch (err) {
    console.error("Lỗi xử lý IPN:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi xử lý IPN",
      error: err.message,
    });
  }
};

// Kiểm tra trạng thái đơn hàng
const checkOrderStatus = async (req, res) => {
  try {
    const { momoOrderId } = req.params;

    // Kiểm tra trong pendingOrders trước
    const pendingOrder = pendingOrders.get(momoOrderId);
    if (pendingOrder) {
      return res.json({
        status: "PENDING",
        paymentStatus: "PENDING",
        message: "Đơn hàng đang chờ thanh toán",
      });
    }

    // Nếu không có trong pendingOrders, kiểm tra trong database
    const order = await Order.findOne({ momoOrderId });
    if (!order) {
      return res.status(404).json({
        message: "Không tìm thấy đơn hàng",
        status: "NOT_FOUND",
        paymentStatus: "NOT_FOUND",
      });
    }

    res.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      message:
        order.paymentStatus === "PAID"
          ? "Thanh toán thành công"
          : "Thanh toán thất bại",
    });
  } catch (error) {
    console.error("Lỗi kiểm tra đơn hàng:", error);
    res.status(500).json({
      message: "Lỗi kiểm tra đơn hàng",
      error: error.message,
      status: "ERROR",
      paymentStatus: "ERROR",
    });
  }
};

module.exports = {
  createOrderFromCart,
  handleMomoIPN,
  checkOrderStatus,
};
