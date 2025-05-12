const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/cart");
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

// 📦 Tạo thanh toán MoMo
router.post("/create", authenticateJWT, async (req, res) => {
  try {
    const { orderData } = req.body;
    console.log("Received order data:", orderData);

    // Kiểm tra dữ liệu đơn hàng
    if (
      !orderData ||
      !orderData.items ||
      !orderData.totalAmount ||
      !orderData.userId ||
      !orderData.shippingAddress
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin đơn hàng" });
    }

    // Tạo đơn hàng trong DB
    const newOrder = new Order({
      user: orderData.userId,
      items: orderData.items.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        image: item.image,
      })),
      totalAmount: orderData.totalAmount,
      finalAmount: orderData.finalAmount,
      shippingAddress: orderData.shippingAddress,
      note: orderData.note || "",
      status: "PENDING",
      paymentMethod: "MOMO",
      paymentStatus: "PENDING",
      voucher: orderData.voucher,
      discountAmount: orderData.discountAmount || 0,
    });

    await newOrder.save();
    console.log("Created new order:", newOrder);

    // Chuẩn bị thông tin gửi đến MoMo
    const requestId = `REQ${Date.now()}`;
    const momoOrderId = `${momoConfig.partnerCode}${Date.now()}`;
    const extraData = Buffer.from(
      JSON.stringify({ orderId: newOrder._id })
    ).toString("base64");

    const momoRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId,
      amount: orderData.totalAmount,
      orderId: momoOrderId,
      orderInfo: `Thanh toán đơn hàng ${momoOrderId}`,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: "vi",
      requestType: momoConfig.requestType,
      extraData,
      accessKey: momoConfig.accessKey,
    };

    momoRequest.signature = generateSignature(momoRequest);
    console.log("Sending request to MoMo:", momoRequest);

    // Gửi yêu cầu thanh toán đến MoMo
    const momoRes = await axios.post(momoConfig.endpoint, momoRequest);
    const momoData = momoRes.data;
    console.log("MoMo response:", momoData);

    if (momoData.resultCode === 0) {
      newOrder.momoOrderId = momoOrderId;
      await newOrder.save();

      return res.status(200).json({
        success: true,
        message: "Tạo thanh toán thành công",
        data: {
          payUrl: momoData.payUrl,
          momoOrderId,
        },
      });
    } else {
      throw new Error(momoData.message || "Tạo thanh toán thất bại");
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

    // Giải mã extraData để lấy orderId
    let parsedExtra;
    try {
      parsedExtra = JSON.parse(Buffer.from(extraData, "base64").toString());
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Dữ liệu extraData không hợp lệ" });
    }

    const order = await Order.findById(parsedExtra.orderId);
    if (!order)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    if (parseInt(resultCode) === 0) {
      // Thanh toán thành công
      order.paymentStatus = "PAID";
      order.status = "PROCESSING";
      order.momoTransactionId = transId;
      order.paidAt = new Date();
      await order.save();

      // Xóa giỏ hàng của người dùng
      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [] } }
      );

      return res.status(200).json({
        message: "Đã xử lý thành công",
        orderId: order._id,
        paymentStatus: "PAID",
      });
    } else {
      // Thanh toán thất bại
      order.paymentStatus = "FAILED";
      order.status = "CANCELLED";
      await order.save();

      return res.status(200).json({
        message: "Thanh toán thất bại",
        error: message,
        resultCode,
      });
    }
  } catch (err) {
    console.error("Lỗi xử lý IPN:", err);
    return res
      .status(500)
      .json({ message: "Lỗi xử lý IPN", error: err.message });
  }
});

// 🔍 Kiểm tra trạng thái đơn hàng
router.get("/status/:orderId", async (req, res) => {
  try {
    const order = await Order.findOne({ momoOrderId: req.params.momoOrderId });

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      user: order.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra đơn hàng", error });
  }
});

module.exports = router;
