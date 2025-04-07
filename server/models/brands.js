const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  logo: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  website: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Cập nhật trường updatedAt trước khi lưu
brandSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

brandSchema.set("toJSON", {
  virtuals: true,
});

exports.Brand = mongoose.model("Brand", brandSchema);
exports.brandSchema = brandSchema;
