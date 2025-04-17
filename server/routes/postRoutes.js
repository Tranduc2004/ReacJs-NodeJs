const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { authenticateJWT } = require("../middleware/auth");

// Lấy tất cả bài viết
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy một bài viết theo ID
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("comments.user", "name email");
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tạo bài viết mới
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    const newPost = new Post({
      title,
      content,
      image,
      tags,
      author: req.user._id,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Cập nhật bài viết
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Không có quyền chỉnh sửa bài viết này" });
    }
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Xóa bài viết
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Không có quyền xóa bài viết này" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa bài viết thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa bài viết:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa bài viết", error: error.message });
  }
});

// Thêm bình luận
router.post("/:id/comments", authenticateJWT, async (req, res) => {
  try {
    console.log("User from token:", req.user);
    console.log("Comment data:", req.body);

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const newComment = {
      user: req.user._id,
      content: req.body.content,
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();

    // Populate thông tin user cho comment mới
    const populatedPost = await Post.findById(updatedPost._id)
      .populate("author", "name email")
      .populate("comments.user", "name email");

    res.json(populatedPost);
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    res.status(500).json({
      message: "Lỗi khi thêm bình luận",
      error: error.message,
    });
  }
});

// Xóa bình luận
router.delete("/:id/comments/:commentId", authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Không có quyền xóa bình luận này" });
    }
    comment.remove();
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thích bài viết
router.post("/:id/like", authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "Bạn đã thích bài viết này" });
    }
    post.likes.push(req.user._id);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bỏ thích bài viết
router.post("/:id/unlike", authenticateJWT, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }
    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "Bạn chưa thích bài viết này" });
    }
    post.likes = post.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
