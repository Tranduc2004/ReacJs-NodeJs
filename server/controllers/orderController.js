const Order = require("../models/Order");
const { Product } = require("../models/products");
const Cart = require("../models/cart");
const User = require("../models/user");
const mongoose = require("mongoose");
const axios = require("axios");
const Voucher = require("../models/Voucher");
const UserVoucher = require("../models/UserVoucher");
const transporter = require("../config/email");

// Hàm gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (order, user) => {
  try {
    // Tính toán lại tổng tiền dựa trên giá thực tế của từng sản phẩm
    let calculatedTotal = 0;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Xác nhận đơn hàng thành công - Bacola",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); background-color: #ffffff;">
          <!-- Logo and Header -->
          <div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <div style="height: 48px; width: 48px; background-color: yellow; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; text-align: center; line-height: 1;">
              <span style="font-size: 24px; display: flex; align-items: center; justify-content: center; height: 100%; width: 100%; margin-top:10px; margin-left:10px;">😀</span>
            </div>
            <div>
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #00aaff;">Bacola</h1>
              <p style="margin: 0; font-size: 12px; color: #777;">Online Grocery Shopping Center</p>
            </div>
          </div>

          <!-- Email Content -->
          <h2 style="color: #00aaff; margin-top: 0;">Xác nhận đơn hàng thành công</h2>
          <p>Xin chào ${user.name},</p>
          <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi. Dưới đây là thông tin chi tiết đơn hàng của bạn:</p>
          
          <!-- Order Info -->
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${
              order._id
            }</p>
            <p style="margin: 5px 0;"><strong>Ngày đặt:</strong> ${new Date(
              order.createdAt
            ).toLocaleString("vi-VN")}</p>
            <p style="margin: 5px 0;"><strong>Phương thức thanh toán:</strong> ${
              order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : "Momo"
            }</p>
          </div>

          <!-- Products Table -->
          <h3 style="color: #00aaff;">Chi tiết sản phẩm:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Sản phẩm</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Số lượng</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
            </tr>
            ${(() => {
              let itemsHtml = "";
              let subtotal = 0;

              order.items.forEach((item) => {
                // Lấy thông tin sản phẩm
                // Nếu item.product đã được populated đầy đủ
                if (item.product && typeof item.product === "object") {
                  const productName = item.product.name || "Không xác định";
                  const originalPrice = item.product.price || 0;
                  const discount = item.product.discount || 0;

                  // Lấy giá sau giảm từ discountedPrice nếu có, nếu không thì tự tính
                  let discountedPrice =
                    typeof item.product.discountedPrice !== "undefined"
                      ? item.product.discountedPrice
                      : originalPrice * (1 - discount / 100);

                  // Không làm tròn giá để giữ nguyên giá gốc trong cơ sở dữ liệu

                  // Cộng vào tổng tiền
                  const lineTotal = discountedPrice * item.quantity;
                  subtotal += lineTotal;

                  itemsHtml += `
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${
                          item.quantity
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                          ${
                            discount > 0
                              ? `<span style=\"text-decoration: line-through; color: #888;\">${originalPrice.toLocaleString(
                                  "vi-VN"
                                )}đ</span><br><span style=\"color: #ed174a; font-weight: bold;\">${discountedPrice.toLocaleString(
                                  "vi-VN"
                                )}đ</span>`
                              : `${originalPrice.toLocaleString("vi-VN")}đ`
                          }
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                          ${lineTotal.toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    `;
                } else {
                  // Sử dụng thông tin từ item (trường hợp không populated hoặc lưu trực tiếp)
                  const productName = item.name || "Không xác định";
                  const originalPrice = item.price || 0;
                  let discountedPrice = originalPrice;

                  // Nếu là item có discount
                  if (item.discount && item.discount > 0) {
                    discountedPrice = originalPrice * (1 - item.discount / 100);
                    // Không làm tròn giá để giữ nguyên giá gốc trong cơ sở dữ liệu
                  }

                  // Cộng vào tổng tiền
                  const lineTotal = discountedPrice * item.quantity;
                  subtotal += lineTotal;

                  itemsHtml += `
                      <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${productName}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${
                          item.quantity
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                          ${
                            item.discount && item.discount > 0
                              ? `<span style=\"text-decoration: line-through; color: #888;\">${originalPrice.toLocaleString(
                                  "vi-VN"
                                )}đ</span><br><span style=\"color: #ed174a; font-weight: bold;\">${discountedPrice.toLocaleString(
                                  "vi-VN"
                                )}đ</span>`
                              : `${originalPrice.toLocaleString("vi-VN")}đ`
                          }
                        </td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                          ${lineTotal.toLocaleString("vi-VN")}đ
                        </td>
                      </tr>
                    `;
                }
              });

              // Lưu tổng tiền hàng để sử dụng sau
              calculatedTotal = subtotal;

              return itemsHtml;
            })()}
          </table>

          <!-- Order Summary -->
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: right;">
            <p style="margin: 5px 0;"><strong>Tổng tiền hàng:</strong> ${calculatedTotal.toLocaleString(
              "vi-VN"
            )}đ</p>
            ${
              order.discountAmount > 0
                ? `<p style=\"margin: 5px 0;\"><strong>Giảm giá (voucher):</strong> -${order.discountAmount.toLocaleString(
                    "vi-VN"
                  )}đ</p>`
                : ""
            }
            <p style="margin: 5px 0; font-size: 18px; color: #ed174a;"><strong>Tổng thanh toán:</strong> ${(
              calculatedTotal - order.discountAmount
            ).toLocaleString("vi-VN")}đ</p>
          </div>

          <!-- Shipping Info -->
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3 style="color: #00aaff; margin-top: 0;">Thông tin giao hàng:</h3>
            <p style="margin: 5px 0;"><strong>Người nhận:</strong> ${
              order.shippingAddress.fullName
            }</p>
            <p style="margin: 5px 0;"><strong>Số điện thoại:</strong> ${
              order.shippingAddress.phone
            }</p>
            <p style="margin: 5px 0;"><strong>Địa chỉ:</strong> ${
              order.shippingAddress.address
            }, ${order.shippingAddress.ward}, ${
        order.shippingAddress.district
      }, ${order.shippingAddress.city}</p>
          </div>

          <p style="margin-top: 20px;">Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.</p>
          <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
          
          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="margin-bottom: 5px;">Trân trọng,</p>
            <p style="margin-top: 0; color: #00aaff; font-weight: bold;">Đội ngũ Bacola</p>
          </div>
        </div>
      `,
    };

    // Log thông tin tính toán để debug nếu cần
    console.log(
      `Tổng tiền hàng đã tính toán: ${calculatedTotal.toLocaleString("vi-VN")}đ`
    );
    console.log(
      `Giảm giá (voucher): ${order.discountAmount.toLocaleString("vi-VN")}đ`
    );
    console.log(
      `Tổng thanh toán: ${(
        calculatedTotal - order.discountAmount
      ).toLocaleString("vi-VN")}đ`
    );

    await transporter.sendMail(mailOptions);
    console.log("Email xác nhận đơn hàng đã được gửi thành công");
  } catch (error) {
    console.error("Lỗi khi gửi email xác nhận đơn hàng:", error);
  }
};
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

    // Tính toán giảm giá từ voucher nếu có
    let discountAmount = 0;
    if (req.body.voucher) {
      // Kiểm tra voucher đã dùng chưa
      const userVoucher = await UserVoucher.findOne({
        user: userId,
        voucher: req.body.voucher,
      });
      if (!userVoucher) {
        return res.status(400).json({
          success: false,
          message: "Bạn chưa lưu voucher này vào kho.",
        });
      }
      if (userVoucher.used) {
        return res.status(400).json({
          success: false,
          message: "Voucher này đã được sử dụng.",
        });
      }
      const voucher = await Voucher.findById(req.body.voucher);
      if (!voucher) {
        return res.status(400).json({
          success: false,
          message: "Voucher không tồn tại.",
        });
      }
      // Kiểm tra voucher đã hết lượt sử dụng chưa
      if (voucher.usedCount >= voucher.usageLimit) {
        return res.status(400).json({
          success: false,
          message: "Voucher đã hết lượt sử dụng.",
        });
      }
      if (voucher.discountType === "PERCENTAGE") {
        discountAmount = (totalAmount * voucher.discountValue) / 100;
        if (voucher.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
        }
      } else {
        discountAmount = voucher.discountValue;
      }
    }

    // Tạo đơn hàng mới (đảm bảo lấy ảnh từ product)
    const newOrder = new Order({
      user: userId,
      items: cart.items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount: item.product.discount || 0,
        image:
          item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : "",
      })),
      shippingAddress,
      paymentMethod,
      note,
      totalAmount: totalAmount,
      discountAmount: discountAmount,
      finalAmount: totalAmount - discountAmount,
      voucher: req.body.voucher || undefined,
    });

    // Lưu đơn hàng
    await newOrder.save();

    // Đánh dấu voucher đã dùng cho user nếu có sử dụng voucher
    if (req.body.voucher) {
      const userVoucher = await UserVoucher.findOne({
        user: userId,
        voucher: req.body.voucher,
      });
      if (userVoucher && !userVoucher.used) {
        await UserVoucher.findOneAndUpdate(
          { user: userId, voucher: req.body.voucher },
          { used: true }
        );
        // Tăng số lần sử dụng của voucher
        await Voucher.findByIdAndUpdate(req.body.voucher, {
          $inc: { usedCount: 1 },
        });
      }
    }

    // Nếu là thanh toán COD, cập nhật trạng thái ngay và populate sản phẩm
    if (paymentMethod === "COD") {
      newOrder.status = "PROCESSING";
      newOrder.paymentStatus = "PENDING"; // Vẫn là pending cho COD đến khi nhận hàng
      await newOrder.save();

      // Populate thông tin sản phẩm trước khi gửi về client
      const populatedOrder = await Order.findById(newOrder._id).populate(
        "items.product",
        "name price rating numReviews images discount"
      );

      // Lấy thông tin user để gửi email
      const user = await User.findById(userId);
      if (user) {
        await sendOrderConfirmationEmail(populatedOrder, user);
      }

      // Xóa giỏ hàng
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );

      // Đảm bảo trả về discount trong từng item
      const orderData = populatedOrder.toObject();
      orderData.items = orderData.items.map((item) => ({
        ...item,
        discount:
          typeof item.discount === "number"
            ? item.discount
            : item.product?.discount || 0,
      }));

      return res.status(200).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: orderData,
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

        // Lấy thông tin user để gửi email
        const user = await User.findById(userId);
        if (user) {
          const populatedOrder = await Order.findById(newOrder._id).populate(
            "items.product",
            "name price rating numReviews images discount"
          );
          await sendOrderConfirmationEmail(populatedOrder, user);
        }

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
      .populate("items.product", "name image discount")
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
      .populate("items.product", "name price image images discount");

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

    // Populate thông tin sản phẩm (THÊM 'images' và 'discount')
    const order = await Order.findOne({ momoOrderId: momoOrderId }).populate(
      "items.product",
      "name price rating numReviews images discount"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Lấy thông tin từ pendingOrders nếu có
    const pendingOrderInfo = pendingOrders.get(momoOrderId);

    // Tạo response data, đảm bảo items chứa product với images và discount
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
              discount: item.product.discount,
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
        discount: typeof item.discount === "number" ? item.discount : undefined, // discount đã lưu trong order item (nếu có)
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
