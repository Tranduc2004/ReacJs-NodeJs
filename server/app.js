const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

// Import routes
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/products");

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.use(cors());
app.options("*", cors());

//middleware
app.use(bodyParser.json());

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// Basic route để test
app.get("/", (req, res) => {
  res.send("Server đang chạy");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running running http://localhost:${process.env.PORT}`);
});
