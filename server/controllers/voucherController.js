const Voucher = require("../models/Voucher");
const Order = require("../models/Order");
const { Product } = require("../models/products");
const Category = require("../models/category");

// Tạo voucher mới
exports.createVoucher = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicableProducts,
      applicableCategories,
    } = req.body;

    // Kiểm tra code đã tồn tại chưa
    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: "Mã voucher đã tồn tại",
      });
    }

    // Kiểm tra ngày tháng
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    const voucher = new Voucher({
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicableProducts,
      applicableCategories,
      createdBy: req.user.id,
    });

    await voucher.save();

    res.status(201).json({
      success: true,
      message: "Tạo voucher thành công",
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh sách voucher
exports.getVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy chi tiết voucher
exports.getVoucherDetail = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id)
      .populate("applicableProducts", "name")
      .populate("applicableCategories", "name");

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    res.json({
      success: true,
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const {
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicableProducts,
      applicableCategories,
      isActive,
    } = req.body;

    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    // Kiểm tra ngày tháng nếu cập nhật
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    // Cập nhật các trường
    Object.assign(voucher, {
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      applicableProducts,
      applicableCategories,
      isActive,
    });

    await voucher.save();

    res.json({
      success: true,
      message: "Cập nhật voucher thành công",
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher",
      });
    }

    // Kiểm tra xem voucher đã được sử dụng chưa
    const usedVoucher = await Order.findOne({ voucher: req.params.id });
    if (usedVoucher) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa voucher đã được sử dụng",
      });
    }

    await voucher.remove();

    res.json({
      success: true,
      message: "Xóa voucher thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Validate và tính toán giá trị giảm giá của voucher
exports.validateVoucher = async (req, res) => {
  try {
    const { code, totalAmount, items } = req.body;

    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Mã voucher không tồn tại",
      });
    }

    // Kiểm tra thời gian hiệu lực
    const now = new Date();
    if (now < voucher.startDate || now > voucher.endDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết hạn hoặc chưa đến thời gian sử dụng",
      });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết lượt sử dụng",
      });
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalAmount < voucher.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải có giá trị tối thiểu ${voucher.minOrderValue.toLocaleString(
          "vi-VN"
        )}đ`,
      });
    }

    // Kiểm tra sản phẩm áp dụng
    if (voucher.applicableProducts.length > 0) {
      const validItems = items.filter((item) =>
        voucher.applicableProducts.includes(item.product)
      );
      if (validItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Voucher không áp dụng cho sản phẩm trong giỏ hàng",
        });
      }
    }

    // Tính toán giá trị giảm giá
    let discountAmount = 0;
    if (voucher.discountType === "PERCENTAGE") {
      discountAmount = (totalAmount * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    const finalAmount = totalAmount - discountAmount;

    res.json({
      success: true,
      message: "Voucher hợp lệ",
      data: {
        voucher,
        discountAmount,
        finalAmount,
      },
    });
  } catch (error) {
    console.error("Lỗi khi validate voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lưu voucher vào kho của user
exports.saveVoucherForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.params;

    // Kiểm tra voucher có tồn tại không
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher không tồn tại",
      });
    }

    const UserVoucher = require("../models/UserVoucher");

    // Kiểm tra xem user đã có voucher này trong kho chưa
    const existingVoucher = await UserVoucher.findOne({
      user: userId,
      voucher: voucherId,
    });

    if (existingVoucher) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã lưu voucher này rồi",
      });
    }

    // Kiểm tra xem voucher đã được sử dụng bởi bất kỳ user nào chưa
    const usedVoucher = await UserVoucher.findOne({
      voucher: voucherId,
      used: true,
    });

    if (usedVoucher) {
      return res.status(400).json({
        success: false,
        message: "Voucher này đã được sử dụng và không thể lưu",
      });
    }

    // Kiểm tra xem user đã có voucher nào trong kho chưa
    const userVoucherCount = await UserVoucher.countDocuments({
      user: userId,
      used: false, // Chỉ đếm các voucher chưa sử dụng
    });

    if (userVoucherCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Bạn chỉ có thể lưu một voucher tại một thời điểm",
      });
    }

    const newUserVoucher = new UserVoucher({
      user: userId,
      voucher: voucherId,
      used: false,
    });

    await newUserVoucher.save();

    res.json({
      success: true,
      message: "Đã lưu voucher vào kho của bạn",
    });

    // Kiểm tra voucher đã hết ngày sử dụng chưa
    const now = new Date();
    if (now > voucher.endDate) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết hạn sử dụng",
      });
    }
  } catch (error) {
    console.error("Lỗi khi lưu voucher:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã lưu voucher này rồi",
      });
    }
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Lấy danh sách voucher đã lưu của user
exports.getSavedVouchersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const UserVoucher = require("../models/UserVoucher");

    const userVouchers = await UserVoucher.find({ user: userId }).populate({
      path: "voucher",
      populate: [
        { path: "applicableProducts", select: "name" },
        { path: "applicableCategories", select: "name" },
      ],
    });

    // Map thông tin used vào voucher
    const vouchers = userVouchers.map((uv) => ({
      ...uv.voucher.toObject(),
      used: uv.used,
    }));

    res.json({
      success: true,
      data: vouchers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher đã lưu:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

// Xóa voucher khỏi kho của user
exports.removeVoucherForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { voucherId } = req.params;
    const UserVoucher = require("../models/UserVoucher");

    const result = await UserVoucher.findOne({
      user: userId,
      voucher: voucherId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy voucher trong kho của bạn",
      });
    }

    if (result.used) {
      return res.status(400).json({
        success: false,
        message: "Voucher này đã được sử dụng, không thể xóa khỏi kho.",
      });
    }

    await UserVoucher.deleteOne({ _id: result._id });

    res.json({
      success: true,
      message: "Đã xóa voucher khỏi kho của bạn",
    });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
