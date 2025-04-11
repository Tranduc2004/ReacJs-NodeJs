const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    console.log("Nhận được tin nhắn:", message);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tin nhắn",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Không tìm thấy GEMINI_API_KEY trong biến môi trường");
      return res.status(500).json({
        success: false,
        message: "Lỗi cấu hình server",
      });
    }

    // Khởi tạo model với phiên bản API chính xác
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    console.log("Đang gửi tin nhắn đến Gemini API...");

    // Gửi tin nhắn và nhận phản hồi
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: message }],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    console.log("Nhận được phản hồi từ Gemini API:", text);

    res.status(200).json({
      success: true,
      message: text,
    });
  } catch (error) {
    console.error("Lỗi chi tiết khi xử lý tin nhắn:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    // Kiểm tra loại lỗi cụ thể
    if (error.message.includes("API key")) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xác thực API. Vui lòng kiểm tra API key.",
      });
    }

    if (error.message.includes("quota")) {
      return res.status(500).json({
        success: false,
        message: "Đã vượt quá giới hạn sử dụng API.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra khi xử lý tin nhắn",
      error: error.message,
    });
  }
};
