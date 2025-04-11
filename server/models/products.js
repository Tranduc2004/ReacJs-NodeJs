const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  richDescription: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  images: [
    {
      type: String,
    },
  ],
  brand: {
    type: Schema.Types.ObjectId,
    ref: "Brand",
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  countInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 1000,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

// Tạo virtual field cho ID
productSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Đảm bảo virtual fields được include trong JSON
productSchema.set("toJSON", {
  virtuals: true,
});

// Tạo model
const Product = mongoose.model("Product", productSchema);

// Export cả model và schema
module.exports = {
  Product,
  productSchema,
};
