const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_Api_Key,
  api_secret: process.env.cloudinary_Config_Api_Secret,
});

// GET tất cả sản phẩm
router.get(`/`, async (req, res) => {
  try {
    const productList = await Product.find().populate("category");
    if (!productList) {
      return res
        .status(500)
        .json({ success: false, message: "Không tìm thấy sản phẩm nào" });
    }
    res.status(200).json(productList);
  } catch (err) {
    console.error("GET products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET sản phẩm theo ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm với ID này",
      });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("GET product by ID error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST tạo sản phẩm mới
router.post("/", async (req, res) => {
  try {
    // Kiểm tra category có tồn tại không
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Danh mục không hợp lệ",
      });
    }

    // Upload nhiều ảnh lên cloudinary
    let imageUrls = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      for (const image of req.body.images) {
        const result = await cloudinary.uploader.upload(image);
        if (!result) {
          return res.status(500).json({
            success: false,
            message: "Upload ảnh thất bại",
          });
        }
        imageUrls.push(result.secure_url);
      }
    }

    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      images: imageUrls,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Tạo sản phẩm thất bại",
      });
    }

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT cập nhật sản phẩm
router.put("/:id", async (req, res) => {
  try {
    // Kiểm tra category có tồn tại không
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không hợp lệ",
        });
      }
    }

    let updateData = {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    };

    // Upload nhiều ảnh mới nếu có
    if (req.body.images && Array.isArray(req.body.images)) {
      let imageUrls = [];
      for (const image of req.body.images) {
        const result = await cloudinary.uploader.upload(image);
        if (!result) {
          return res.status(500).json({
            success: false,
            message: "Upload ảnh thất bại",
          });
        }
        imageUrls.push(result.secure_url);
      }
      updateData.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm với ID này",
      });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE xóa sản phẩm
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm với ID này",
      });
    }
    res.status(200).json({ success: true, message: "Sản phẩm đã được xóa" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET số lượng sản phẩm
router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    res.status(200).json({ productCount });
  } catch (err) {
    console.error("Get product count error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET sản phẩm nổi bật
router.get("/get/featured/:count", async (req, res) => {
  try {
    const count = req.params.count ? parseInt(req.params.count) : 0;
    const products = await Product.find({ isFeatured: true }).limit(count);
    res.status(200).json(products);
  } catch (err) {
    console.error("Get featured products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
