const Category = require("../models/category.js");
const { Product } = require("../models/products.js");
const { Brand } = require("../models/brands.js");
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
    let filter = {};

    // Xử lý tìm kiếm theo tên sản phẩm
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" };
    }

    // Xử lý lọc theo danh mục
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Xử lý lọc theo thương hiệu
    if (req.query.brand) {
      filter.brand = req.query.brand;
    }

    // Xử lý lọc theo khoảng giá
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    const productList = await Product.find(filter)
      .populate("category")
      .populate("brand");

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
    console.log("ID nhận được từ client:", req.params.id); // Log ID
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("brand"); // Thêm populate cho brand
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
    const {
      name,
      description,
      richDescription,
      price,
      countInStock,
      isFeatured,
      category,
      brand,
      images,
    } = req.body;

    // Kiểm tra danh mục
    const foundCategory = await Category.findById(category);
    if (!foundCategory)
      return res
        .status(400)
        .json({ success: false, message: "Danh mục không hợp lệ" });

    // Kiểm tra thương hiệu
    if (brand) {
      const foundBrand = await Brand.findById(brand);
      if (!foundBrand)
        return res
          .status(400)
          .json({ success: false, message: "Thương hiệu không hợp lệ" });
    }

    // Upload ảnh lên Cloudinary nếu là base64
    let imageUrls = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.startsWith("data:image")) {
          const uploaded = await cloudinary.uploader.upload(img, {
            resource_type: "image",
            folder: "products",
          });
          imageUrls.push(uploaded.secure_url);
        } else {
          // Nếu là URL sẵn có thì giữ nguyên
          imageUrls.push(img);
        }
      }
    }

    const newProduct = new Product({
      name,
      description,
      richDescription: richDescription || "",
      price,
      countInStock,
      isFeatured: isFeatured || false,
      category,
      brand: brand || null,
      images: imageUrls,
    });

    const saved = await newProduct.save();
    const populated = await Product.findById(saved._id)
      .populate("category")
      .populate("brand");

    res.status(201).json({ success: true, product: populated });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo sản phẩm",
      error: error.message,
    });
  }
});

// PUT cập nhật sản phẩm
router.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      description,
      richDescription,
      price,
      countInStock,
      isFeatured,
      category,
      brand,
      images,
    } = req.body;

    console.log("Dữ liệu cập nhật:", {
      productId,
      ...req.body,
    });

    // Kiểm tra sản phẩm tồn tại
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Tạo object chứa dữ liệu cập nhật
    const updateData = {};

    // Cập nhật các trường cơ bản
    if (name) updateData.name = name.trim();
    if (description) updateData.description = description.trim();
    if (richDescription) updateData.richDescription = richDescription.trim();
    if (price) updateData.price = Number(price);
    if (countInStock !== undefined)
      updateData.countInStock = Number(countInStock);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    // Xử lý category
    if (category) {
      const foundCategory = await Category.findById(category);
      if (!foundCategory) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }
      updateData.category = category;
    }

    // Xử lý brand
    if (brand) {
      const foundBrand = await Brand.findById(brand);
      if (!foundBrand) {
        return res.status(400).json({
          success: false,
          message: "Thương hiệu không tồn tại",
        });
      }
      updateData.brand = brand;
    } else {
      updateData.brand = null;
    }

    // Xử lý images
    if (images && Array.isArray(images)) {
      let imageUrls = [];
      for (const img of images) {
        if (img.startsWith("data:image")) {
          try {
            const uploaded = await cloudinary.uploader.upload(img, {
              resource_type: "image",
              folder: "products",
            });
            imageUrls.push(uploaded.secure_url);
          } catch (uploadError) {
            console.error("Lỗi upload ảnh:", uploadError);
            return res.status(500).json({
              success: false,
              message: "Lỗi khi upload ảnh",
              error: uploadError.message,
            });
          }
        } else {
          imageUrls.push(img);
        }
      }
      updateData.images = imageUrls;
    }

    console.log("Dữ liệu sau khi xử lý:", updateData);

    // Cập nhật sản phẩm
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("category brand");

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        message: "Không thể cập nhật sản phẩm",
      });
    }

    res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật sản phẩm",
      error: error.message,
    });
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
    const products = await Product.find({ isFeatured: true })
      .limit(count)
      .populate("category")
      .populate("brand");
    res.status(200).json(products);
  } catch (err) {
    console.error("Get featured products error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
