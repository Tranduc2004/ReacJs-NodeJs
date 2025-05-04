const express = require("express");
const router = express.Router();
const { Product } = require("../models/products.js");
const Category = require("../models/category.js");
const { Brand } = require("../models/brands.js");
const { authenticateJWT } = require("../middleware/auth");
const admin = require("../middleware/admin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const productLikeRouter = require("./productLikeRoutes");
const ProductLike = require("../models/ProductLike.js");

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

// Lấy danh sách sản phẩm yêu thích của người dùng
router.get("/likes", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("User ID:", userId); // Debug log

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng",
      });
    }

    const likes = await ProductLike.find({ user: userId }).populate({
      path: "product",
      populate: [
        { path: "category", select: "name" },
        { path: "brand", select: "name" },
      ],
    });

    if (!likes || likes.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const products = likes.map((like) => like.product);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm yêu thích:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách sản phẩm yêu thích",
      error: error.message,
    });
  }
});

// GET sản phẩm theo ID
router.get("/:id", async (req, res) => {
  try {
    console.log("ID nhận được từ client:", req.params.id);
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("brand");
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

// GET sản phẩm gợi ý
router.get("/:id/suggestions", async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(
      "[GET /products/:id/suggestions] Đang xử lý request với productId:",
      productId
    );

    // Kiểm tra xem productId có hợp lệ không
    if (!productId) {
      console.log("[GET /products/:id/suggestions] ID sản phẩm trống");
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Kiểm tra độ dài ID thay vì dùng mongoose.Types.ObjectId.isValid
    if (productId.length !== 24) {
      console.log(
        "[GET /products/:id/suggestions] ID sản phẩm không đúng định dạng:",
        productId
      );
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm không hợp lệ",
      });
    }

    // Tìm sản phẩm và populate category và brand
    const product = await Product.findById(productId)
      .populate("category")
      .populate("brand");
    console.log("[GET /products/:id/suggestions] Sản phẩm tìm được:", product);

    if (!product) {
      console.log(
        "[GET /products/:id/suggestions] Không tìm thấy sản phẩm với ID:",
        productId
      );
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm với ID này",
      });
    }

    // Xây dựng query dựa trên dữ liệu có sẵn
    let query = {
      _id: { $ne: productId }, // Loại trừ sản phẩm hiện tại
    };

    const orConditions = [];

    // Thêm điều kiện category nếu có
    if (product.category) {
      orConditions.push({ category: product.category._id });
    }

    // Thêm điều kiện brand nếu có
    if (product.brand) {
      orConditions.push({ brand: product.brand._id });
    }

    // Nếu có ít nhất một điều kiện, thêm vào query
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    console.log(
      "[GET /products/:id/suggestions] Query tìm sản phẩm gợi ý:",
      JSON.stringify(query, null, 2)
    );

    // Nếu không có điều kiện lọc, trả về mảng rỗng
    if (orConditions.length === 0) {
      console.log(
        "[GET /products/:id/suggestions] Không có điều kiện lọc, trả về mảng rỗng"
      );
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Lấy sản phẩm gợi ý
    const suggestedProducts = await Product.find(query)
      .limit(4)
      .populate("category")
      .populate("brand");

    console.log(
      "[GET /products/:id/suggestions] Số lượng sản phẩm gợi ý tìm được:",
      suggestedProducts.length
    );
    console.log(
      "[GET /products/:id/suggestions] Danh sách sản phẩm gợi ý:",
      suggestedProducts
    );
    res.status(200).json({
      success: true,
      data: suggestedProducts,
    });
  } catch (error) {
    console.error(
      "[GET /products/:id/suggestions] Lỗi khi lấy sản phẩm gợi ý:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy sản phẩm gợi ý",
      error: error.message,
    });
  }
});

// Thêm route cho yêu thích sản phẩm
router.use("/:productId/like", productLikeRouter);

// POST tạo sản phẩm mới
router.post("/", async (req, res) => {
  try {
    const {
      name,
      description,
      richDescription,
      price,
      discount,
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
      discount: discount || 0,
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
      discount,
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
    if (discount !== undefined) updateData.discount = Number(discount);
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

// GET sản phẩm theo danh mục
router.get("/category/:categoryId", async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("Đang tìm sản phẩm theo danh mục:", categoryId);

    // Kiểm tra xem danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Lấy danh sách sản phẩm thuộc danh mục
    const products = await Product.find({ category: categoryId })
      .populate("category")
      .populate("brand");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy sản phẩm theo danh mục",
      error: error.message,
    });
  }
});

module.exports = router;
