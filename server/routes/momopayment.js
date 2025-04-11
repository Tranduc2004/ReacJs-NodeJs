const express = require("express");
const router = express.Router();
const axios = require("axios");
const crypto = require("crypto");

// Các thông số cần thiết
const partnerCode = "MOMO";
const accessKey = "F8BBA842ECF85";
const secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
const requestType = "captureWallet";
const extraData = "";

// Tạo route cho thanh toán Momo
router.post("/create", async (req, res) => {
  try {
    const { amount, orderInfo } = req.body;

    if (!amount || !orderInfo) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId;
    const redirectUrl = "https://webhook.site/your-url";
    const ipnUrl = "https://webhook.site/your-url";

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");

    const momoRequestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi",
    };

    const result = await axios({
      url: "https://test-payment.momo.vn/v2/gateway/api/create",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: momoRequestBody,
    });

    if (result.data && result.data.payUrl) {
      return res.status(200).json({
        success: true,
        data: {
          payUrl: result.data.payUrl,
          orderId,
        },
      });
    } else {
      throw new Error("Không nhận được URL thanh toán từ MOMO");
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng Momo",
      error: error.response?.data || error.message,
    });
  }
});

// Route xử lý IPN
router.post("/ipn", (req, res) => {
  console.log("Nhận được IPN từ MOMO:", req.body);
  res.status(200).json({ success: true });
});

module.exports = router;
