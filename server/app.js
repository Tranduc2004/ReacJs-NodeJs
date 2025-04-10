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
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const sliderRoutes = require("./routes/sliders");
const reviewRoutes = require("./routes/reviews");

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Cấu hình CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
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
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/reviews", reviewRoutes);

// Basic route để test
app.get("/", (req, res) => {
  res.send("Server đang chạy");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running running http://localhost:${process.env.PORT}`);
});
