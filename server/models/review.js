const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isAdminComment: {
    type: Boolean,
    default: false,
  },
  adminRole: {
    type: String,
    enum: ["admin", "superadmin"],
    default: null,
  },
  adminReplies: [
    {
      content: { type: String },
      createdAt: { type: Date },
      admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
});

// Tạo index để đảm bảo mỗi user chỉ có thể review một sản phẩm một lần
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Middleware để cập nhật rating trung bình của sản phẩm sau khi thêm/sửa/xóa review
reviewSchema.post("save", async function () {
  const Product = mongoose.model("Product");
  const product = await Product.findById(this.product);

  const reviews = await this.constructor.find({ product: this.product });
  const avgRating =
    reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

  product.rating = avgRating;
  product.numReviews = reviews.length;
  await product.save();
});

reviewSchema.post("remove", async function () {
  const Product = mongoose.model("Product");
  const product = await Product.findById(this.product);

  const reviews = await this.constructor.find({ product: this.product });
  if (reviews.length > 0) {
    const avgRating =
      reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
    product.rating = avgRating;
    product.numReviews = reviews.length;
  } else {
    product.rating = 0;
    product.numReviews = 0;
  }
  await product.save();
});

module.exports = mongoose.model("Review", reviewSchema);
