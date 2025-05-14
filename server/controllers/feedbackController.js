const Feedback = require("../models/Feedback");

// Gửi đánh giá mới
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const feedback = new Feedback({
      name,
      email,
      subject,
      message,
    });

    await feedback.save();
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách đánh giá (cho admin)
exports.getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đánh giá
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    feedback.status = status;
    await feedback.save();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
