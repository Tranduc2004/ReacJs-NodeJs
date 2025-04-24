const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/cart");
const { createOrderFromCart } = require("../controllers/orderController");
const { authenticateJWT } = require("../middleware/auth");

// Cấu hình MoMo Test
const momoConfig = {
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  redirectUrl: "http://localhost:3001/thank-you",
  ipnUrl: "http://localhost:4000/api/momo/ipn",
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

// 📦 Tạo thanh toán MoMo
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    // Kiểm tra thông tin bắt buộc
    if (!req.body.shippingAddress || !req.body.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
        missingFields: {
          shippingAddress: !req.body.shippingAddress,
          paymentMethod: !req.body.paymentMethod,
        },
      });
    }

    // Chuẩn bị thông tin gửi đến MoMo
    const requestId = `REQ${Date.now()}`;
    const momoOrderId = `${momoConfig.partnerCode}${Date.now()}`;

    // Tạo đơn hàng tạm thời
    const orderItems = req.body.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const newOrder = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      status: "PENDING",
      paymentStatus: "PENDING",
      momoOrderId: momoOrderId,
      note: req.body.note || "",
    });

    // Lưu đơn hàng tạm thời
    await newOrder.save();

    // Lưu thông tin đơn hàng tạm thời vào Map
    pendingOrders.set(momoOrderId, {
      orderId: newOrder._id.toString(),
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      note: req.body.note || "",
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
      amount: req.body.totalAmount,
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
      // Xóa đơn hàng tạm thời nếu tạo thanh toán thất bại
      await Order.findByIdAndDelete(newOrder._id);
      pendingOrders.delete(momoOrderId);

      return res.status(400).json({
        success: false,
        message: momoData.message || "Tạo thanh toán thất bại",
      });
    }
  } catch (err) {
    console.error("Lỗi tạo thanh toán:", err);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo thanh toán",
      error: err.message,
    });
  }
});

// 📩 Xử lý IPN từ MoMo
router.post("/ipn", async (req, res) => {
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
        // Cập nhật đơn hàng đã tồn tại
        const updatedOrder = await Order.findByIdAndUpdate(
          dbOrderId,
          {
            status: "PROCESSING",
            paymentStatus: "PAID",
            momoTransactionId: transId,
            paidAt: new Date(),
          },
          { new: true }
        );

        if (!updatedOrder) {
          throw new Error("Không tìm thấy đơn hàng để cập nhật");
        }

        // Xóa giỏ hàng
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });

        // Xóa thông tin đơn hàng tạm thời
        pendingOrders.delete(orderId);

        return res.status(200).json({
          message: "Đã xử lý thành công",
          orderId: updatedOrder._id,
          paymentStatus: "PAID",
          status: "SUCCESS",
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        return res.status(500).json({
          message: "Lỗi khi cập nhật đơn hàng",
          error: error.message,
          status: "ERROR",
        });
      }
    } else if (parseInt(resultCode) === 1006) {
      // Người dùng hủy thanh toán
      try {
        // Cập nhật trạng thái đơn hàng thành CANCELLED
        await Order.findByIdAndUpdate(dbOrderId, {
          status: "CANCELLED",
          paymentStatus: "CANCELLED",
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái hủy:", error);
      }

      pendingOrders.delete(orderId);
      return res.status(200).json({
        message: "Người dùng đã hủy thanh toán",
        paymentStatus: "CANCELLED",
        status: "CANCELLED",
      });
    } else {
      // Thanh toán thất bại vì lý do khác
      try {
        // Cập nhật trạng thái đơn hàng thành FAILED
        await Order.findByIdAndUpdate(dbOrderId, {
          status: "FAILED",
          paymentStatus: "FAILED",
        });
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái thất bại:", error);
      }

      pendingOrders.delete(orderId);
      return res.status(200).json({
        message: "Thanh toán thất bại",
        error: message,
        resultCode,
        paymentStatus: "FAILED",
        status: "FAILED",
      });
    }
  } catch (err) {
    console.error("Lỗi xử lý IPN:", err);
    return res.status(500).json({
      message: "Lỗi xử lý IPN",
      error: err.message,
      status: "ERROR",
    });
  }
});

// 🔍 Kiểm tra trạng thái đơn hàng
router.get("/status/:momoOrderId", authenticateJWT, async (req, res) => {
  try {
    // Kiểm tra trong pendingOrders trước
    const pendingOrder = pendingOrders.get(req.params.momoOrderId);
    if (pendingOrder) {
      return res.json({
        status: "PENDING",
        paymentStatus: "PENDING",
        totalAmount: pendingOrder.totalAmount,
        user: pendingOrder.userId,
        message: "Đơn hàng đang chờ thanh toán",
      });
    }

    // Nếu không có trong pendingOrders, kiểm tra trong database
    const order = await Order.findOne({ momoOrderId: req.params.momoOrderId });
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
      user: order.user,
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
});

module.exports = router;
