const { Brand } = require("../models/brands");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_Api_Key,
  api_secret: process.env.cloudinary_Config_Api_Secret,
});

// GET tất cả brands
router.get("/", async (req, res) => {
  try {
    const brandList = await Brand.find();
    if (!brandList) {
      return res.status(500).json({ success: false });
    }
    res.status(200).json(brandList);
  } catch (err) {
    console.error("GET brands error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET brand theo ID
router.get("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thương hiệu với ID này",
      });
    }
    res.status(200).json(brand);
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

// POST tạo brand mới với upload logo
router.post("/", async (req, res) => {
  try {
    console.log("Cloudinary config:", cloudinary.config());

    if (!req.body.name || !req.body.logo) {
      return res.status(400).json({
        success: false,
        error: "Thiếu thông tin bắt buộc (name, logo)",
      });
    }

    // Upload logo lên Cloudinary
    const result = await cloudinary.uploader.upload(req.body.logo, {
      folder: "brands",
    });

    const brand = new Brand({
      name: req.body.name,
      logo: result.secure_url,
      description: req.body.description || "",
      website: req.body.website || "",
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    const savedBrand = await brand.save();
    if (!savedBrand) {
      return res.status(400).json({
        success: false,
        error: "Không thể tạo thương hiệu",
      });
    }

    res.status(201).json(savedBrand);
  } catch (err) {
    console.error("POST brand error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT cập nhật brand
router.put("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thương hiệu với ID này",
      });
    }

    // Nếu có logo mới, upload lên Cloudinary
    let logoUrl = brand.logo;
    if (req.body.logo && req.body.logo !== brand.logo) {
      const result = await cloudinary.uploader.upload(req.body.logo, {
        folder: "brands",
      });
      logoUrl = result.secure_url;
    }

    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name || brand.name,
        logo: logoUrl,
        description:
          req.body.description !== undefined
            ? req.body.description
            : brand.description,
        website:
          req.body.website !== undefined ? req.body.website : brand.website,
        isActive:
          req.body.isActive !== undefined ? req.body.isActive : brand.isActive,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json(updatedBrand);
  } catch (err) {
    console.error("PUT brand error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE xóa brand
router.delete("/:id", async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thương hiệu với ID này",
      });
    }

    // Xóa logo từ Cloudinary nếu cần
    if (brand.logo) {
      const publicId = brand.logo.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`brands/${publicId}`);
    }

    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (!deletedBrand) {
      return res.status(400).json({
        success: false,
        error: "Không thể xóa thương hiệu",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa thương hiệu thành công",
    });
  } catch (err) {
    console.error("DELETE brand error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
