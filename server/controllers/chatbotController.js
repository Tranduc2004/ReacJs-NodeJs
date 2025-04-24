const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Product } = require("../models/products");
const Category = require("../models/category");
const { Brand } = require("../models/brands");

// Khởi tạo Gemini API với API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Hàm lấy thông tin sản phẩm để tạo context cho chatbot
const getProductContext = async () => {
  try {
    const products = await Product.find({ price: { $lt: 1000000 } })
      .populate("category", "name")
      .populate("brand", "name")
      .limit(50);

    const productContext = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category?.name || "Không có danh mục",
      brand: product.brand?.name || "Không có thương hiệu",
      countInStock: product.countInStock,
      image:
        product.images && product.images.length > 0 ? product.images[0] : null,
    }));

    return productContext;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin sản phẩm:", error);
    return [];
  }
};

// Hàm xử lý text từ Gemini API
const processGeminiResponse = (text) => {
  if (!text) return "";

  // Loại bỏ ký tự điều khiển và khoảng trắng thừa
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
};

// Hàm kiểm tra và sửa JSON không hợp lệ
const fixInvalidJson = (text) => {
  try {
    // Tìm vị trí bắt đầu và kết thúc của JSON
    const jsonStart =
      text.indexOf("[") !== -1 ? text.indexOf("[") : text.indexOf("{");
    const jsonEnd =
      text.lastIndexOf("]") !== -1
        ? text.lastIndexOf("]") + 1
        : text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Không tìm thấy JSON");
    }

    // Trích xuất phần JSON
    const jsonText = text.substring(jsonStart, jsonEnd);

    // Parse thử JSON
    return JSON.parse(jsonText);
  } catch (e) {
    throw new Error("Không thể sửa JSON không hợp lệ");
  }
};

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

    // Lấy thông tin sản phẩm để tạo context
    const productContext = await getProductContext();

    // Tạo prompt với context sản phẩm
    const systemPrompt = `Bạn là một trợ lý bán hàng thông minh. Dưới đây là danh sách sản phẩm trong cửa hàng:
    ${JSON.stringify(productContext, null, 2)}
    
    Quy tắc trả lời:
    1. Trả lời ngắn gọn, súc tích và thân thiện
    2. Chỉ trả lời MỘT lần cho mỗi câu hỏi
    3. KHÔNG lặp lại câu trả lời
    4. KHÔNG trả lời nhiều lần cho cùng một câu hỏi
    
    Định dạng trả lời:
    1. Nếu là yêu cầu về một sản phẩm cụ thể: 
       {"id": "...", "name": "...", "price": number, "description": "...", "image": "..."}
    2. Nếu là yêu cầu về nhiều sản phẩm: 
       [{"id": "...", "name": "...", "price": number, "description": "...", "image": "..."}, ...]
    3. Nếu không phải yêu cầu về sản phẩm: 
       Trả lời bình thường bằng text, KHÔNG bao gồm JSON
    
    Câu hỏi: ${message}`;

    console.log("Đang gửi tin nhắn đến Gemini API...");

    // Khởi tạo model với phiên bản API chính xác
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      },
    });

    // Gửi tin nhắn và nhận phản hồi
    const result = await model.generateContent({
      contents: [{ parts: [{ text: systemPrompt }] }],
    });

    const response = await result.response;
    let text = response.text();
    console.log("Raw response from Gemini:", text);

    // Xử lý response
    try {
      // Tìm và trích xuất JSON nếu có
      const jsonMatch = text.match(/\{[^]*\}|\[[^]*\]/);

      if (jsonMatch) {
        try {
          const jsonStr = jsonMatch[0];
          const jsonResponse = JSON.parse(jsonStr);

          // Kiểm tra cấu trúc JSON
          if (Array.isArray(jsonResponse)) {
            if (
              jsonResponse.every(
                (product) =>
                  product &&
                  product.id &&
                  product.name &&
                  typeof product.price === "number"
              )
            ) {
              return res.status(200).json({
                success: true,
                isProduct: true,
                products: jsonResponse,
              });
            }
          } else if (
            jsonResponse &&
            jsonResponse.id &&
            jsonResponse.name &&
            typeof jsonResponse.price === "number"
          ) {
            return res.status(200).json({
              success: true,
              isProduct: true,
              product: jsonResponse,
            });
          }
        } catch (jsonError) {
          console.error("Lỗi khi parse JSON:", jsonError);
        }
      }

      // Xử lý như text thông thường
      // Loại bỏ phần JSON nếu có
      text = text.replace(/\{[^]*\}|\[[^]*\]/, "").trim();
      text = processGeminiResponse(text);

      // Kiểm tra text
      if (!text || text.length < 10) {
        text =
          "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn được không?";
      }

      return res.status(200).json({
        success: true,
        isProduct: false,
        message: text,
      });
    } catch (error) {
      console.error("Lỗi khi xử lý response:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xử lý tin nhắn",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Lỗi chi tiết khi xử lý tin nhắn:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

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
