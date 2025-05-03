const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv/config");
const passport = require("passport");
const session = require("express-session");
require("./config/passport");

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
const orderRoutes = require("./routes/orders");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/auth");
const momoPaymentRoutes = require("./routes/momopayment");

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Cấu hình session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 giờ
    },
  })
);

// Cấu hình CORS
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    credentials: true,
  })
);

//middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/momo", momoPaymentRoutes);
app.use("/api/users", userRoutes);

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
