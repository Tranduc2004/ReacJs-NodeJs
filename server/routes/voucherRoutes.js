const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { authenticateJWT } = require("../middleware/auth");
const admin = require("../middleware/admin");

// Routes cho admin
router.post("/", authenticateJWT, admin, voucherController.createVoucher);
router.get("/", voucherController.getVouchers);
router.get("/:id", authenticateJWT, admin, voucherController.getVoucherDetail);
router.put("/:id", authenticateJWT, admin, voucherController.updateVoucher);
router.delete("/:id", authenticateJWT, admin, voucherController.deleteVoucher);

// Route cho user validate voucher
router.post("/validate", authenticateJWT, voucherController.validateVoucher);

module.exports = router;
