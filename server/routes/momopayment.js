const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

// Thông tin test MOMO
const config = {
  partnerCode: "MOMOBKUN20180529",
  accessKey: "klm05TvNBzhg7h7j",
  secretKey: "at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa",
  redirectUrl: "http://localhost:4000/thank-you",
  ipnUrl: "http://localhost:4000/api/momo/ipn",
  requestType: "captureWallet",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
};

// Tạo route cho thanh toán Momo
router.post("/create", async (req, res) => {
  try {
    const { amount, orderInfo } = req.body;
    console.log("Received request:", { amount, orderInfo });

    // Validate input
    if (!amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc: amount hoặc orderInfo",
      });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ",
      });
    }

    const requestId = config.partnerCode + new Date().getTime();
    const orderId = requestId;
    const orderType = "momo_wallet";
    const lang = "vi";
    const extraData = "";

    // Tạo chữ ký
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;
    const signature = crypto
      .createHmac("sha256", config.secretKey)
      .update(rawSignature)
      .digest("hex");

    // Tạo request body
    const requestBody = {
      partnerCode: config.partnerCode,
      partnerName: "Test",
      storeId: "MomoTestStore",
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      lang: lang,
      requestType: config.requestType,
      autoCapture: true,
      extraData: extraData,
      orderGroupId: "",
      signature: signature,
    };

    console.log("Sending request to MOMO:", requestBody);

    const response = await axios({
      method: "POST",
      url: config.endpoint,
      headers: {
        "Content-Type": "application/json",
      },
      data: requestBody,
      timeout: 10000, // 10 seconds timeout
    });

    console.log("MOMO response:", response.data);

    if (response.data && response.data.payUrl) {
      return res.status(200).json({
        success: true,
        data: {
          payUrl: response.data.payUrl,
          orderId: orderId,
          requestId: requestId,
          signature: signature,
        },
      });
    } else {
      throw new Error(
        "Không nhận được URL thanh toán từ MOMO: " +
          JSON.stringify(response.data)
      );
    }
  } catch (error) {
    console.error("MOMO payment error:", {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
    });

    let errorMessage = "Lỗi khi tạo thanh toán MOMO";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === "ECONNREFUSED") {
      errorMessage = "Không thể kết nối đến máy chủ MOMO";
    } else if (error.code === "ETIMEDOUT") {
      errorMessage = "Yêu cầu thanh toán MOMO đã hết thời gian chờ";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message,
    });
  }
});

// Route xử lý IPN
router.post("/ipn", async (req, res) => {
  try {
    console.log("Received IPN:", req.body);
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

    // Xác thực chữ ký
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    const checkSignature = crypto
      .createHmac("sha256", config.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (checkSignature !== signature) {
      return res.status(400).json({
        message: "Invalid signature",
      });
    }

    // Xử lý kết quả thanh toán
    if (resultCode === 0) {
      // Thanh toán thành công
      console.log("Payment successful:", {
        orderId,
        amount,
        transId,
      });
    }

    return res.status(200).json({
      message: "Successfully processed",
    });
  } catch (error) {
    console.error("IPN processing error:", error);
    return res.status(500).json({
      message: "Error processing IPN",
      error: error.message,
    });
  }
});

module.exports = router;
