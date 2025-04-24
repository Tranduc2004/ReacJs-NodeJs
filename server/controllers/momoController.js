const crypto = require("crypto");
const axios = require("axios");
const Order = require("../models/Order");
const mongoose = require("mongoose");

const config = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMOBKUN20180529",
  accessKey: process.env.MOMO_ACCESS_KEY || "klm05TvNBzhg7h7j",
  secretKey: process.env.MOMO_SECRET_KEY || "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/orders",
  ipnUrl: process.env.MOMO_IPN_URL || "http://your-api-domain.com/api/momo/ipn",
  requestType: "captureWallet",
};

// Generate secure signature
const generateSignature = (data) => {
  const raw = `accessKey=${config.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${data.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
  return crypto
    .createHmac("sha256", config.secretKey)
    .update(raw)
    .digest("hex");
};

// Create MoMo payment
exports.createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId } = req.body;

    // Validate order
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.user.toString() !== req.user.id.toString()) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    if (order.paymentMethod !== "momo" || order.status !== "pending_payment") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Đơn hàng không hỗ trợ thanh toán MoMo",
      });
    }

    // Prepare MoMo request
    const requestId = mongoose.Types.ObjectId().toString();
    const extraData = Buffer.from(
      JSON.stringify({ orderId: order._id.toString() })
    ).toString("base64");

    const momoRequest = {
      partnerCode: config.partnerCode,
      partnerName: "E-Commerce",
      storeId: "E-Commerce-Store",
      requestId,
      amount: order.totalAmount,
      orderId: requestId, // Using new requestId as MoMo orderId
      orderInfo: `Thanh toán đơn hàng #${order._id.toString().slice(-6)}`,
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      lang: "vi",
      requestType: config.requestType,
      extraData,
    };

    momoRequest.signature = generateSignature(momoRequest);

    // Call MoMo API
    const response = await axios.post(config.endpoint, momoRequest);
    const momoData = response.data;

    if (momoData.resultCode !== 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: momoData.message || "Không thể khởi tạo thanh toán",
      });
    }

    // Update order with MoMo reference
    order.paymentReference = {
      momoOrderId: requestId,
      payUrl: momoData.payUrl,
    };
    await order.save({ session });
    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        payUrl: momoData.payUrl,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("MoMo payment error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tạo thanh toán",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Handle MoMo IPN (Instant Payment Notification)
exports.handleIPN = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      orderId,
      requestId,
      amount,
      transId,
      resultCode,
      message,
      extraData,
      signature,
    } = req.body;

    // Verify signature
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${config.partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const expectedSignature = crypto
      .createHmac("sha256", config.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (signature !== expectedSignature) {
      await session.abortTransaction();
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Parse extraData to get orderId
    const { orderId: localOrderId } = JSON.parse(
      Buffer.from(extraData, "base64").toString()
    );

    const order = await Order.findById(localOrderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // Process payment result
    if (parseInt(resultCode) === 0) {
      // Payment success
      order.status = "processing";
      order.paymentStatus = "paid";
      order.paymentReference.transactionId = transId;
      order.paymentReference.paidAt = new Date();

      // Reduce product quantities
      for (const item of order.items) {
        await mongoose
          .model("Product")
          .findByIdAndUpdate(
            item.product,
            { $inc: { countInStock: -item.quantity } },
            { session }
          );
      }
    } else {
      // Payment failed
      order.status = "cancelled";
      order.paymentStatus = "failed";
    }

    await order.save({ session });
    await session.commitTransaction();

    // Return success regardless of payment result
    res.json({ message: "IPN processed successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("IPN processing error:", error);
    res.status(500).json({ message: "Error processing IPN" });
  } finally {
    session.endSession();
  }
};

// Check payment status
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra xem orderId có phải là ObjectId hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID đơn hàng không hợp lệ",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.json({
      success: true,
      data: {
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        // Thêm thông tin thanh toán MoMo nếu cần
        momoInfo:
          order.paymentMethod === "momo"
            ? {
                momoOrderId: order.paymentReference?.momoOrderId,
                transactionId: order.paymentReference?.transactionId,
              }
            : undefined,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi kiểm tra trạng thái thanh toán",
      error: error.message,
    });
  }
};
