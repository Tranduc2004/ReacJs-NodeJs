const { Slider } = require("../models/sliders.js");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_Api_Key,
  api_secret: process.env.cloudinary_Config_Api_Secret,
});

// GET tất cả slider
router.get("/", async (req, res) => {
  try {
    const sliderList = await Slider.find().sort({ order: 1 });

    if (!sliderList) {
      return res
        .status(500)
        .json({ success: false, message: "Không tìm thấy slider nào" });
    }
    res.status(200).json(sliderList);
  } catch (err) {
    console.error("GET sliders error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET slider theo ID
router.get("/:id", async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slider với ID này",
      });
    }
    res.status(200).json(slider);
  } catch (err) {
    console.error("GET slider by ID error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST tạo slider mới (upload ảnh nếu ảnh là base64)
router.post("/", async (req, res) => {
  try {
    const { name, description, image, link, order, isActive } = req.body;

    let imageUrl = image;

    // Nếu ảnh là base64 (chưa phải URL), upload lên Cloudinary
    if (image && !image.startsWith("http")) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "sliders",
      });
      imageUrl = result.secure_url;
    }

    const slider = new Slider({
      name,
      description,
      image: imageUrl,
      link,
      order,
      isActive,
    });

    const savedSlider = await slider.save();
    res.status(201).json(savedSlider);
  } catch (err) {
    console.error("POST slider error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT cập nhật slider (upload ảnh nếu ảnh là base64)
router.put("/:id", async (req, res) => {
  try {
    const { name, description, image, link, order, isActive } = req.body;

    let imageUrl = image;

    // Nếu có ảnh mới và ảnh là base64, upload lên Cloudinary
    if (image && !image.startsWith("http")) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "sliders",
      });
      imageUrl = result.secure_url;
    }

    const updatedSlider = await Slider.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        image: imageUrl, // cập nhật với ảnh mới nếu có
        link,
        order,
        isActive,
      },
      { new: true }
    );

    if (!updatedSlider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slider với ID này",
      });
    }
    res.status(200).json(updatedSlider);
  } catch (err) {
    console.error("PUT slider error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE xóa slider
router.delete("/:id", async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy slider với ID này",
      });
    }
    res.status(200).json({ success: true, message: "Xóa slider thành công" });
  } catch (err) {
    console.error("DELETE slider error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
