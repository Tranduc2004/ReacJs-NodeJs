const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/user");
const Admin = require("../models/admin");
const { authenticateJWT, isAdmin } = require("../middleware/auth");

// Lấy danh sách tin nhắn của user
router.get("/user", authenticateJWT, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, senderType: "User" },
        { receiver: req.user._id, receiverType: "User" },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy tin nhắn",
    });
  }
});

// Lấy danh sách tin nhắn của admin
router.get("/admin", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, senderType: "Admin" },
        { receiver: req.user.id, receiverType: "Admin" },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy tin nhắn:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy tin nhắn",
    });
  }
});

// Gửi tin nhắn từ user
router.post("/user/send", authenticateJWT, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Kiểm tra admin tồn tại
    const admin = await Admin.findById(receiverId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy admin",
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      senderType: "User",
      receiver: receiverId,
      receiverType: "Admin",
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi tin nhắn",
    });
  }
});

// Gửi tin nhắn từ admin
router.post("/admin/send", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findById(receiverId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const message = await Message.create({
      sender: req.user.id,
      senderType: "Admin",
      receiver: receiverId,
      receiverType: "User",
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi gửi tin nhắn",
    });
  }
});

// Đánh dấu tin nhắn đã đọc
router.put("/read/:senderId", authenticateJWT, async (req, res) => {
  try {
    const { senderId } = req.params;
    const userId = req.user._id;
    const userType = req.user.role === "admin" ? "Admin" : "User";

    // Cập nhật tất cả tin nhắn chưa đọc từ senderId
    const result = await Message.updateMany(
      {
        sender: senderId,
        receiver: userId,
        receiverType: userType,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    if (result.modifiedCount > 0) {
      res.json({
        success: true,
        message: "Đã đánh dấu tin nhắn đã đọc",
        data: {
          modifiedCount: result.modifiedCount,
        },
      });
    } else {
      res.json({
        success: true,
        message: "Không có tin nhắn nào cần đánh dấu đã đọc",
        data: {
          modifiedCount: 0,
        },
      });
    }
  } catch (error) {
    console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi đánh dấu tin nhắn đã đọc",
    });
  }
});

// Lấy danh sách người dùng đã chat với admin
router.get("/admin/users", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, senderType: "Admin" },
        { receiver: req.user.id, receiverType: "Admin" },
      ],
    }).distinct("receiver");

    const users = await User.find({
      _id: { $in: messages },
    }).select("name email");

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách người dùng",
    });
  }
});

// Lấy danh sách admin đã chat với user
router.get("/user/admins", authenticateJWT, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, senderType: "User" },
        { receiver: req.user._id, receiverType: "User" },
      ],
    }).distinct("receiver");

    const admins = await Admin.find({
      _id: { $in: messages },
    }).select("name email");

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách admin:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy danh sách admin",
    });
  }
});

// Lấy tất cả user cho admin chat (giống adminUsers)
router.get("/admin/all-users", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const role = req.query.role || "all";
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role !== "all") query.role = role;
    if (status === "active") query.isActive = true;
    else if (status === "inactive") query.isActive = false;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Lấy số tin nhắn chưa đọc của user
router.get("/user/unread", authenticateJWT, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user._id,
          receiverType: "User",
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    // Chuyển đổi kết quả thành object với key là senderId
    const unreadMessages = {};
    unreadCounts.forEach((item) => {
      unreadMessages[item._id.toString()] = item.count;
    });

    res.json({
      success: true,
      data: unreadMessages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy số tin nhắn chưa đọc",
    });
  }
});

// Lấy số tin nhắn chưa đọc của admin
router.get("/admin/unread", authenticateJWT, isAdmin, async (req, res) => {
  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiver: req.user.id,
          receiverType: "Admin",
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    // Chuyển đổi kết quả thành object với key là senderId
    const unreadMessages = {};
    unreadCounts.forEach((item) => {
      unreadMessages[item._id.toString()] = item.count;
    });

    res.json({
      success: true,
      data: unreadMessages,
    });
  } catch (error) {
    console.error("Lỗi khi lấy số tin nhắn chưa đọc:", error);
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi lấy số tin nhắn chưa đọc",
    });
  }
});

module.exports = router;
