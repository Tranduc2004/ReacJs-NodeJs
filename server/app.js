const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv/config");

// Import routes
const categoryRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const brandRoutes = require("./routes/brands");
const adminRoutes = require("./routes/admin");
const adminUsersRoutes = require("./routes/adminUsers");
const adminOrdersRoutes = require("./routes/admin/orders");
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const sliderRoutes = require("./routes/sliders");
const reviewRoutes = require("./routes/reviews");
const chatbotRoutes = require("./routes/chatbotRoutes");
const momoRoutes = require("./routes/momopayment");
const orderRoutes = require("./routes/orders");
const postRoutes = require("./routes/postRoutes");

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Cấu hình CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUsersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/posts", postRoutes);

// Basic route để test
app.get("/", (req, res) => {
  res.send("Server đang chạy");
});

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Không tìm thấy route",
  });
});

// Xử lý lỗi server
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Có lỗi xảy ra ở server",
    error: err.message,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running running http://localhost:${process.env.PORT}`);
});
