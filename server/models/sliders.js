const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên slider là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Ảnh slider là bắt buộc"],
    },
    link: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Slider = mongoose.model("Slider", sliderSchema);

module.exports = { Slider };
