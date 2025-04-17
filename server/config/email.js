const nodemailer = require("nodemailer");

console.log("Đang khởi tạo transporter email...");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  process.env.EMAIL_PASS ? "Đã cấu hình" : "Chưa cấu hình"
);

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error(
    "Lỗi: EMAIL_USER hoặc EMAIL_PASS chưa được cấu hình trong file .env"
  );
}

// Tạo transporter với cấu hình Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Kiểm tra kết nối email
transporter.verify((error, success) => {
  if (error) {
    console.error("Lỗi kết nối email:", error);
  } else {
    console.log("Kết nối email thành công");
  }
});

module.exports = transporter;
