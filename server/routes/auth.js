const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const transporter = require("../config/email");
const crypto = require("crypto");
const passport = require("passport");
const Voucher = require("../models/Voucher");
const UserVoucher = require("../models/UserVoucher");

// Middleware xác thực token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Lỗi xác thực:", error);
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Tạo token JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// Đăng ký người dùng
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // Tạo người dùng mới
    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    // Tạo token
    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm người dùng theo email
    const user = await User.findOne({ email }).select("+password");
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.isActive) {
      return res.status(401).json({ message: "Tài khoản đã bị khóa" });
    }

    // Tạo token
    const token = generateToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập chi tiết:", error);
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
});

// Lấy thông tin người dùng hiện tại
router.get("/me", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});
// Cập nhật thông tin người dùng
router.put("/me", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    console.error("Lỗi cập nhật thông tin:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Đổi mật khẩu
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Route quên mật khẩu
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản với email này",
      });
    }

    // Tạo token reset mật khẩu
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // 1 giờ

    // Lưu token vào database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Tạo link reset mật khẩu
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Gửi email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Đặt lại mật khẩu - Bacola",
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
            <h2 style="color: #00aaff; margin-top: 0;">Đặt lại mật khẩu</h2>
            <p>Xin chào ${user.name},</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
            <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 25px; background-color: #00aaff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <p style="color: #777; font-size: 14px;">Liên kết này sẽ hết hạn sau 1 giờ.</p>
            <p style="color: #777; font-size: 14px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            
            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin-bottom: 5px;">Trân trọng,</p>
              <p style="margin-top: 0; color: #00aaff; font-weight: bold;">Đội ngũ Bacola</p>
            </div>
          </div>
        `,
      });

      res.json({
        success: true,
        message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
      });
    } catch (emailError) {
      console.error("Lỗi khi gửi email:", emailError);
      // Nếu gửi email thất bại, xóa token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.",
      });
    }
  } catch (error) {
    console.error("Lỗi khi xử lý yêu cầu quên mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra, vui lòng thử lại sau",
    });
  }
});

// Route reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    console.log("Bắt đầu xử lý yêu cầu reset mật khẩu");
    const { token } = req.params;
    const { password } = req.body;

    console.log("Token nhận được:", token);
    console.log("Mật khẩu mới:", password);

    if (!token || !password) {
      console.log("Thiếu token hoặc mật khẩu");
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp token và mật khẩu mới",
      });
    }

    // Tìm user với token và kiểm tra thời hạn
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Không tìm thấy user hoặc token đã hết hạn");
      return res.status(400).json({
        success: false,
        message:
          "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu reset mật khẩu lại.",
      });
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // Cập nhật mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    console.log("Đặt lại mật khẩu thành công cho user:", user._id);

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đặt lại mật khẩu",
    });
  }
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/signin?error=google_auth_failed",
  }),
  async (req, res) => {
    try {
      // Tạo token JWT
      const token = generateToken(req.user);
      console.log("Generated token:", token);
      console.log("User data:", req.user);

      // Chuyển hướng về client với token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/google/callback?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Lỗi xử lý callback Google:", error);
      res.redirect(`${process.env.CLIENT_URL}/signin?error=google_auth_failed`);
    }
  }
);

// Facebook OAuth routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email", "public_profile"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "http://localhost:3001/signin",
  }),
  async (req, res) => {
    try {
      // Tạo token JWT
      const token = generateToken(req.user);
      console.log("Generated token:", token);
      console.log("User data:", req.user);

      // Chuyển hướng về client với token
      const redirectUrl = `${process.env.CLIENT_URL}/auth/facebook/callback?token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Lỗi xử lý callback Facebook:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/signin?error=facebook_auth_failed`
      );
    }
  }
);

// Routes cho voucher

// Lấy danh sách voucher đã lưu
router.get("/vouchers/saved", auth, async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }
    const savedVouchers = await UserVoucher.find({
      user: req.user._id,
    }).populate({
      path: "voucher",
      select:
        "name code discountType discountValue minOrderValue startDate endDate description applicableProducts applicableCategories",
      populate: [
        { path: "applicableProducts", select: "name price images" },
        { path: "applicableCategories", select: "name" },
      ],
    });
    const currentDate = new Date();
    const validVouchers = savedVouchers
      .filter((uv) => {
        const voucher = uv.voucher;
        return (
          voucher &&
          new Date(voucher.startDate) <= currentDate &&
          new Date(voucher.endDate) >= currentDate
        );
      })
      .map((uv) => ({
        ...uv.voucher.toObject(),
        used: uv.used,
      }));
    res.json({
      success: true,
      data: validVouchers,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher đã lưu:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách voucher đã lưu",
      error: error.message,
    });
  }
});

// Lưu voucher
router.post("/vouchers/save/:voucherId", auth, async (req, res) => {
  try {
    const { voucherId } = req.params;
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }
    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã giảm giá",
      });
    }
    const currentDate = new Date();
    if (
      new Date(voucher.startDate) > currentDate ||
      new Date(voucher.endDate) < currentDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Mã giảm giá không còn hiệu lực",
      });
    }
    // Kiểm tra voucher đã hết lượt sử dụng chưa
    if (voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Voucher đã hết lượt sử dụng, không thể lưu vào kho nữa",
      });
    }
    // Kiểm tra user đã từng dùng voucher này chưa
    const existed = await UserVoucher.findOne({
      user: req.user._id,
      voucher: voucherId,
    });
    if (existed && existed.used) {
      return res.status(400).json({
        success: false,
        message: "Voucher này đã được sử dụng, không thể lưu lại.",
      });
    }
    // Kiểm tra đã lưu chưa
    if (existed) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã lưu mã giảm giá này" });
    }
    await UserVoucher.create({ user: req.user._id, voucher: voucherId });
    res.json({ success: true, message: "Đã lưu mã giảm giá thành công" });
  } catch (error) {
    console.error("Lỗi khi lưu voucher:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Bạn đã lưu mã giảm giá này" });
    }
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lưu mã giảm giá",
      error: error.message,
    });
  }
});

// Xóa voucher đã lưu
router.delete("/vouchers/save/:voucherId", auth, async (req, res) => {
  try {
    const { voucherId } = req.params;
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }
    const savedVoucher = await UserVoucher.findOne({
      user: userId,
      voucher: voucherId,
    });
    if (!savedVoucher) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy mã giảm giá đã lưu" });
    }
    if (savedVoucher.used) {
      return res
        .status(400)
        .json({ success: false, message: "Không thể xóa voucher đã sử dụng" });
    }
    await UserVoucher.deleteOne({ _id: savedVoucher._id });
    res.json({ success: true, message: "Đã xóa mã giảm giá khỏi kho" });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xóa mã giảm giá",
      error: error.message,
    });
  }
});

module.exports = router;
