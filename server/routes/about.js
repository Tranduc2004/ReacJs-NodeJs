const express = require("express");
const router = express.Router();
const contactInfoController = require("../controllers/contactInfoController");
const feedbackController = require("../controllers/feedbackController");
const admin = require("../middleware/admin");
const { authenticateJWT } = require("../middleware/auth");

// Routes cho thông tin liên hệ
router.get("/contact-info", contactInfoController.getContactInfo);
router.put(
  "/contact-info",
  authenticateJWT,
  admin,
  contactInfoController.updateContactInfo
);

// Routes cho đánh giá
router.post("/feedback", feedbackController.createFeedback);
router.get(
  "/feedback",
  authenticateJWT,
  admin,
  feedbackController.getFeedbacks
);
router.put(
  "/feedback/:id",
  authenticateJWT,
  admin,
  feedbackController.updateFeedbackStatus
);

module.exports = router;
