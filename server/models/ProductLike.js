const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Schema định nghĩa cấu trúc của một lượt "thích" sản phẩm.
 * Mỗi document trong collection này đại diện cho một lần một user cụ thể thích một product cụ thể.
 */
const productLikeSchema = new Schema(
  {
    // Liên kết tới người dùng đã thực hiện hành động thích
    // 'ref: 'User'' cho Mongoose biết trường này tham chiếu đến model 'User'
    user: {
      type: Schema.Types.ObjectId, // Kiểu dữ liệu ID của MongoDB
      ref: "User", // Tham chiếu tới model User (bạn cần đảm bảo đã định nghĩa model User)
      required: true, // Trường này là bắt buộc
      index: true, // Tạo index để tăng tốc độ truy vấn theo user
    },
    // Liên kết tới sản phẩm được thích
    // 'ref: 'Product'' cho Mongoose biết trường này tham chiếu đến model 'Product'
    product: {
      type: Schema.Types.ObjectId, // Kiểu dữ liệu ID của MongoDB
      ref: "Product", // Tham chiếu tới model Product (bạn cần đảm bảo đã định nghĩa model Product)
      required: true, // Trường này là bắt buộc
      index: true, // Tạo index để tăng tốc độ truy vấn theo product
    },
  },
  {
    // Tự động thêm hai trường: createdAt và updatedAt
    timestamps: true,
  }
);

// Tạo unique index để đảm bảo mỗi user chỉ thích một sản phẩm một lần
productLikeSchema.index({ user: 1, product: 1 }, { unique: true });

// Tạo và export model 'ProductLike' dựa trên schema đã định nghĩa
const ProductLike = mongoose.model("ProductLike", productLikeSchema);

module.exports = ProductLike;
