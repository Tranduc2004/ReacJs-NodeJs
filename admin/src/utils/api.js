// api.js - Updated version

import axios from "axios";

const API_URL = "http://localhost:4000/api";

// Create a base axios instance with consistent configuration
export const apiClient = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to ensure token is always set from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "Token được thêm vào request:",
        token.substring(0, 10) + "..."
      );
    } else {
      console.log("Không tìm thấy token trong localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle token expiration consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("Response error:", error.response?.status, error.config?.url);

    if (error.response && error.response.status === 401) {
      // Chỉ xóa token khi không phải là request đăng nhập hoặc đăng ký
      const requestUrl = error.config.url;
      if (!requestUrl.includes("/login") && !requestUrl.includes("/register")) {
        console.log("Token hết hạn, xóa trạng thái xác thực");

        // Xóa token và thông tin admin
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_info");

        // Không chuyển hướng tự động, để component xử lý
        console.log("Token không hợp lệ hoặc đã hết hạn");
      }
    }
    return Promise.reject(error);
  }
);

// Thêm hàm để lưu token
export const setAuthToken = (token) => {
  if (token) {
    // Lưu token vào localStorage
    localStorage.setItem("admin_token", token);

    // Lưu thông tin admin đầy đủ hơn
    const adminInfo = JSON.parse(localStorage.getItem("admin_info") || "{}");
    adminInfo.token = token;
    localStorage.setItem("admin_info", JSON.stringify(adminInfo));

    // Thiết lập token trong header của axios
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("Token đã được lưu:", token.substring(0, 10) + "...");
  } else {
    // Xóa token khỏi localStorage
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_info");

    // Xóa token khỏi header của axios
    delete apiClient.defaults.headers.common["Authorization"];

    console.log("Token đã được xóa");
  }
};

// Hàm kiểm tra token
export const checkToken = () => {
  return !!localStorage.getItem("admin_token");
};

// Hàm login
export const loginAdmin = async (credentials) => {
  try {
    const { data } = await apiClient.post("/api/admin/login", credentials);
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
};

// Hàm logout
export const logoutAdmin = async () => {
  try {
    const token = localStorage.getItem("admin_token");
    if (token) {
      await apiClient.post("/api/admin/logout", {});
    }
    setAuthToken(null);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    // Xóa token ngay cả khi API gọi thất bại
    setAuthToken(null);
    throw error;
  }
};

export const fetchDataFromApi = async (url) => {
  try {
    const { data } = await apiClient.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const postData = async (url, formData) => {
  try {
    const response = await apiClient.post(url, formData);
    return response.data; // Trả về dữ liệu từ phản hồi
  } catch (error) {
    console.error(`Error posting data to ${url}:`, error); // In chi tiết lỗi với URL
    throw new Error(`Failed to post data to ${url}: ${error.message}`); // Ném lỗi có thông báo chi tiết
  }
};

export const editData = async (url, updatedData) => {
  try {
    const response = await apiClient.put(url, updatedData);
    return response.data;
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật dữ liệu tại ${url}:`,
      error.response?.data || error.message
    );

    // Nếu là lỗi 401, xóa token và chuyển hướng về trang đăng nhập
    if (error.response?.status === 401) {
      setAuthToken(null);
      window.location.href = "/login";
      return;
    }

    // Nếu có thông báo lỗi từ server, ném lỗi với thông báo đó
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Nếu không có thông báo lỗi từ server, ném lỗi với thông báo mặc định
    throw new Error(`Không thể cập nhật dữ liệu: ${error.message}`);
  }
};

export const deleteData = async (url, id) => {
  try {
    const response = await apiClient.delete(`${url}${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};

export const viewData = async (url, id) => {
  try {
    const apiUrl = url.endsWith("/") ? `/api${url}${id}` : `/api${url}/${id}`;

    console.log("Requesting URL:", apiUrl);
    const { data } = await apiClient.get(apiUrl);
    console.log("Data returned from server:", data);
    return data;
  } catch (error) {
    console.error(
      "Error fetching data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Hàm đăng ký admin
export const registerAdmin = async (adminData) => {
  try {
    const { data } = await apiClient.post("/api/admin/register", adminData);

    // Nếu server trả về token mới (trường hợp admin đầu tiên)
    if (data.token) {
      setAuthToken(data.token);
    }

    return data;
  } catch (error) {
    console.error("Lỗi đăng ký admin:", error.response?.data || error.message);

    // Rethrow the error with the original message from the server
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};

// User Management APIs
export const fetchUsersApi = async (page = 1, search = "") => {
  const response = await apiClient.get(`/api/admin/users`, {
    params: { page, limit: 10, search },
  });
  return response.data;
};

export const fetchUserDetailApi = async (userId) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user detail:", error);
    throw error;
  }
};

// Thêm API lấy lịch sử đơn hàng của user
export const fetchUserOrdersApi = async (userId) => {
  try {
    const response = await apiClient.get(`/api/admin/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error;
  }
};

export const toggleUserStatusApi = async (userId, isActive) => {
  try {
    const response = await apiClient.put(
      `/api/admin/users/${userId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái:", error);
    throw error;
  }
};

export const exportUsersExcelApi = async () => {
  const response = await apiClient.get("/api/admin/users/export", {
    responseType: "blob",
  });
  return response.data;
};

export const updateUserApi = async (userId, data) => {
  try {
    const response = await apiClient.put(`/api/admin/users/${userId}`, data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    throw error;
  }
};

export const deleteUserApi = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    throw error;
  }
};

// Thêm API lấy tất cả đơn hàng
export const fetchAllOrdersApi = async () => {
  try {
    const response = await apiClient.get(`/api/admin/orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

// Lấy số đơn hàng mới
export const getNewOrdersCount = async () => {
  try {
    const response = await apiClient.get("/api/admin/orders/new-count");
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Lỗi khi lấy số đơn hàng mới");
    }
  } catch (error) {
    console.error("Error in getNewOrdersCount:", error);
    throw error;
  }
};
