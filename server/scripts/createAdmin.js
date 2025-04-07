const mongoose = require("mongoose");
const Admin = require("../models/admin");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

const createFirstAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await Admin.findOne({ role: "superadmin" });
    if (existingAdmin) {
      console.log("Đã tồn tại tài khoản superadmin!");
      process.exit(0);
    }

    // Tạo admin mới
    const admin = new Admin({
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      fullName: "Super Admin",
      role: "superadmin",
      isActive: true,
    });

    await admin.save();
    console.log("Tạo tài khoản admin thành công!");
    console.log("Username: admin");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    process.exit(0);
  }
};

createFirstAdmin();
