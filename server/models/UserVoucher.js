const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userVoucherSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    voucher: {
      type: Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Tạo unique index để đảm bảo mỗi user chỉ lưu một voucher một lần
userVoucherSchema.index({ user: 1, voucher: 1 }, { unique: true });

module.exports = mongoose.model("UserVoucher", userVoucherSchema);
