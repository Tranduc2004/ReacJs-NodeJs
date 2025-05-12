const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng nhập tên"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Vui lòng nhập email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu"],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
      select: false,
    },
    phone: {
      type: String,
      required: function () {
        // Chỉ bắt buộc nếu không phải đăng nhập bằng Google hoặc Facebook
        return !this.googleId && !this.facebookId;
      },
      validate: {
        validator: function (v) {
          // Bỏ qua validation nếu là đăng nhập Google/Facebook và không có phone
          if ((this.googleId || this.facebookId) && !v) return true;
          // Kiểm tra định dạng số điện thoại
          return /^[0-9]{10}$/.test(v);
        },
        message: "Số điện thoại không hợp lệ",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    facebookId: {
      type: String,
      sparse: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  try {
    // Nếu mật khẩu không thay đổi thì bỏ qua
    if (!this.isModified("password")) {
      return next();
    }

    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error in password hashing:", error);
    next(error);
  }
});

// Phương thức kiểm tra mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log("Comparing passwords...");
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password comparison result:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error in matchPassword:", error);
    throw error;
  }
};

// Virtual populate cho đơn hàng
userSchema.virtual("orders", {
  ref: "Order",
  localField: "_id",
  foreignField: "user",
  justOne: false,
});

// Đảm bảo virtuals được trả về khi dùng toObject/toJSON
userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
