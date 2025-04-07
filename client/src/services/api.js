import axios from "axios";

// Tạo instance axios cho tất cả API
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ xử lý logout khi không phải API cart
      if (!error.config.url.includes("/cart")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Kiểm tra xác thực
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// API cho cart
export const getCart = async () => {
  try {
    if (!isAuthenticated()) {
      return { items: [] };
    }
    const response = await api.get("/cart");
    return response;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    if (error.response?.status === 401) {
      return { items: [] };
    }
    throw error;
  }
};

export const fetchCartCount = async () => {
  try {
    if (!isAuthenticated()) {
      return 0;
    }
    const cart = await getCart();
    return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (error) {
    console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    return 0;
  }
};

export const addToCart = async (productId, quantity) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
  }

  try {
    const response = await api.post("/cart/add", { productId, quantity });
    return response;
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    throw error;
  }
};

export const updateCartItem = async (productId, quantity) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để cập nhật giỏ hàng");
  }
  try {
    const response = await api.put("/cart/update", { productId, quantity });
    return response;
  } catch (error) {
    console.error("Lỗi khi cập nhật giỏ hàng:", error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng");
  }
  try {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};

export const clearCart = async () => {
  if (!isAuthenticated()) {
    throw new Error("Vui lòng đăng nhập để xóa giỏ hàng");
  }
  try {
    const response = await api.delete("/cart/clear");
    return response;
  } catch (error) {
    console.error("Lỗi khi xóa giỏ hàng:", error);
    throw error;
  }
};

// API cho categories (sử dụng api gốc)
const getCategories = () => api.get("/categories");

const getCategoryById = async (id) => {
  try {
    console.log(`Calling getCategoryById API for ID: ${id}...`);
    const response = await api.get(`/category/${id}`);
    console.log("Category detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy danh mục với ID ${id}:`, error);
    throw error;
  }
};

// API cho products
const getProducts = () => api.get("/products");
const getProductById = (id) => api.get(`/products/${id}`);
const searchProducts = (params) => {
  return api.get("/products", { params });
};
const getSearchSuggestions = (query) => {
  return api.get("/products/suggestions", { params: { q: query } });
};

// API cho brands
const getBrands = () => api.get("/brands");
const getBrandById = async (id) => {
  try {
    console.log(`Calling getBrandById API for ID: ${id}...`);
    const response = await api.get(`/brands/${id}`);
    console.log("Brand detail response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thương hiệu với ID ${id}:`, error);
    throw error;
  }
};

// API cho authentication
const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.token) {
      localStorage.setItem("token", response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    if (response && response.token) {
      localStorage.setItem("token", response.token);
      const { token, ...userData } = response;
      localStorage.setItem("user", JSON.stringify(userData));
    }
    return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Lấy thông tin người dùng
export const getUserProfile = async () => {
  return api.get("/auth/me");
};

// Cập nhật thông tin người dùng
export const updateUserProfile = async (data) => {
  return api.put("/auth/me", data);
};

// Đổi mật khẩu
export const changePassword = (data) => {
  return api.put("/auth/change-password", data);
};

export {
  api,
  getCategories,
  getCategoryById,
  getProducts,
  getProductById,
  getBrands,
  getBrandById,
  register,
  login,
  logout,
  searchProducts,
  getSearchSuggestions,
};
