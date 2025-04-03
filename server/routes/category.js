const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_Api_Key,
  api_secret: process.env.cloudinary_Config_Api_Secret,
});

// GET tất cả categories
router.get("/", async (req, res) => {
  try {
    const categoryList = await Category.find();
    if (!categoryList) {
      return res.status(500).json({ success: false });
    }
    res.status(200).json(categoryList);
  } catch (err) {
    console.error("GET categories error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET category theo ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục với ID này",
      });
    }
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// POST tạo category mới với upload ảnh
router.post("/", async (req, res) => {
  try {
    console.log("Cloudinary config:", cloudinary.config());

    if (!req.body.name || !req.body.image || !req.body.color) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc (name, image, color)",
      });
    }

    // Upload ảnh lên cloudinary
    const result = await cloudinary.uploader.upload(req.body.image);
    console.log("Upload result:", result);

    if (!result) {
      return res.status(500).json({
        success: false,
        error: "Upload ảnh thất bại",
      });
    }

    let category = new Category({
      name: req.body.name,
      image: result.secure_url,
      color: req.body.color,
    });

    category = await category.save();

    if (!category) {
      return res.status(500).json({
        success: false,
        error: "Tạo danh mục thất bại",
      });
    }

    res.status(201).json({ success: true, category });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({
      success: false,
      error: {
        message: err.message,
        name: err.name,
        stack: err.stack,
      },
    });
  }
});

// PUT cập nhật category
router.put("/:id", async (req, res) => {
  try {
    let updateData = {
      name: req.body.name,
      color: req.body.color,
    };

    if (req.body.image) {
      const result = await cloudinary.uploader.upload(req.body.image);
      if (!result) {
        return res.status(500).json({
          success: false,
          error: "Upload ảnh thất bại",
        });
      }
      updateData.image = result.secure_url;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục với ID này",
      });
    }
    res.status(200).json({ success: true, category });
  } catch (err) {
    console.error("Update category error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE xóa category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục với ID này",
      });
    }
    res.status(200).json({ success: true, message: "Danh mục đã được xóa" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
