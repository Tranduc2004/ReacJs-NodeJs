const express = require("express");
const router = express.Router();
const {
  createOrderFromCart,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
} = require("../controllers/orderController");
const { authenticateJWT } = require("../middleware/auth");
const moment = require("moment");
const Order = require("../models/Order");
const config = require("../config/default.json");
const vnp_TmnCode = config.vnp_TmnCode;
const vnp_HashSecret = config.vnp_HashSecret;
const vnp_Url = config.vnp_Url;
const vnp_ReturnUrl = config.vnp_ReturnUrl;

// Tất cả các route đều yêu cầu xác thực
router.use(authenticateJWT);

// Tạo đơn hàng từ giỏ hàng
router.post("/", createOrderFromCart);

// Lấy danh sách đơn hàng của người dùng
router.get("/", getUserOrders);

// Lấy chi tiết đơn hàng
router.get("/:id", getOrderDetail);

// Hủy đơn hàng
router.put("/:id/cancel", cancelOrder);

// Hàm sắp xếp object theo key (dùng cho VNPAY)
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

// Tạo payment URL cho VNPAY (chuẩn hóa: truyền orderId, lưu trạng thái đơn hàng)
router.post("/create_payment_url", async function (req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  const moment = require("moment");
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket?.remoteAddress;
  let tmnCode = vnp_TmnCode;
  let secretKey = vnp_HashSecret;
  let vnpUrl = vnp_Url;
  let returnUrl = vnp_ReturnUrl;
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;
  let locale = req.body.language || "vn";
  let currCode = "VND";

  // 1. Tạo đơn hàng trước (trạng thái: PENDING)
  const userId = req.user.id;
  const order = new Order({
    user: userId,
    items: req.body.items || [],
    shippingAddress: req.body.shippingAddress,
    paymentMethod: "VNPAY",
    totalAmount: amount,
    finalAmount: amount,
    status: "PENDING",
    paymentStatus: "PENDING",
    vnpayOrderId: "", // sẽ cập nhật sau khi nhận IPN
    vnpayTransactionId: "", // sẽ cập nhật sau khi nhận IPN
    createdAt: new Date(),
  });
  await order.save();
  const orderId = order._id.toString();

  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId; // Truyền orderId vào đây
  vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang: " + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  // Trả về link cho frontend tự redirect (RESTful)
  res.json({
    success: true,
    paymentUrl: vnpUrl,
    orderId,
  });
});

// Xử lý VNPAY returnUrl (chỉ redirect, không cập nhật trạng thái)
router.get("/vnpay_return", function (req, res, next) {
  // Có thể render trang cảm ơn hoặc redirect về client
  res.redirect(vnp_ReturnUrl);
});

// Xử lý VNPAY IPN (cập nhật trạng thái đơn hàng và lưu vnpayOrderId, vnpayTransactionId)
router.get("/vnpay_ipn", async function (req, res, next) {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];
  let orderId = vnp_Params["vnp_TxnRef"];
  let rspCode = vnp_Params["vnp_ResponseCode"];
  let vnpayOrderId = vnp_Params["vnp_TxnRef"];
  let vnpayTransactionId = vnp_Params["vnp_TransactionNo"] || "";
  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];
  vnp_Params = sortObject(vnp_Params);
  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    // Tìm đơn hàng trong DB
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }
    // Kiểm tra số tiền
    if (order.totalAmount * 100 !== Number(vnp_Params["vnp_Amount"])) {
      return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });
    }
    // Cập nhật trạng thái đơn hàng và lưu mã giao dịch VNPAY
    order.vnpayOrderId = vnpayOrderId;
    order.vnpayTransactionId = vnpayTransactionId;
    if (rspCode === "00") {
      order.status = "PROCESSING";
      order.paymentStatus = "PAID";
    } else {
      order.status = "CANCELLED";
      order.paymentStatus = "FAILED";
    }
    await order.save();
    return res.status(200).json({ RspCode: "00", Message: "Success" });
  } else {
    return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });
  }
});

module.exports = router;
