import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  FormControl,
  Card,
  CardContent,
  MenuItem,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp, IoCardSharp } from "react-icons/io5";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { getCart } from "../../services/api";
import { toast } from "react-hot-toast";
import axios from "axios";

// Set baseURL for axios
axios.defaults.baseURL = "http://localhost:4000";

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    cityName: "",
    district: "",
    districtName: "",
    ward: "",
    wardName: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  // Address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Get user info from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);

      // Pre-fill user data if available
      if (userData.fullName) {
        setFormData((prev) => ({
          ...prev,
          fullName: userData.fullName || "",
          phone: userData.phone || "",
        }));
      }
    }

    // Fetch cart data
    const fetchCart = async () => {
      try {
        const response = await getCart();
        if (!response.items || response.items.length === 0) {
          toast.error("Giỏ hàng trống");
          navigate("/cart");
          return;
        }
        setCartItems(response.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    // Fetch provinces
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
      }
    };

    fetchCart();
    fetchProvinces();
  }, [navigate]);

  // Fetch districts when province changes
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const selectedProvince = provinces.find((p) => p.code === provinceCode);

    setFormData({
      ...formData,
      city: provinceCode,
      cityName: selectedProvince ? selectedProvince.name : "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
    });

    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    }
  };

  // Fetch wards when district changes
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const selectedDistrict = districts.find((d) => d.code === districtCode);

    setFormData({
      ...formData,
      district: districtCode,
      districtName: selectedDistrict ? selectedDistrict.name : "",
      ward: "",
      wardName: "",
    });

    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    }
  };

  // Update ward when selected
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const selectedWard = wards.find((w) => w.code === wardCode);

    setFormData({
      ...formData,
      ward: wardCode,
      wardName: selectedWard ? selectedWard.name : "",
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10 chữ số";

    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường/xã";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra dữ liệu trước khi gửi
      if (!user?._id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Giỏ hàng trống");
      }

      const totalAmount = calculateTotal();
      if (totalAmount <= 0) {
        throw new Error("Tổng tiền không hợp lệ");
      }

      // Chuẩn bị dữ liệu đơn hàng
      const orderData = {
        userId: user._id,
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          image:
            item.product.image ||
            (item.product.images && item.product.images[0]) ||
            "",
        })),
        totalAmount: totalAmount,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.cityName,
          district: formData.districtName,
          ward: formData.wardName,
        },
        note: note || "",
        paymentMethod: paymentMethod,
      };

      // If payment method is MoMo, proceed with MoMo payment
      if (paymentMethod === "MOMO") {
        await handleMomoPayment();
      } else {
        // For COD, create order directly
        const orderPayload = {
          ...orderData,
          products: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
          })),
        };

        try {
          const orderResponse = await axios.post("/api/orders", orderPayload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (orderResponse.data.success) {
            toast.success("Đặt hàng thành công!");
            navigate("/thank-you", {
              state: {
                order: orderResponse.data.data,
                message: "Đơn hàng của bạn đã được đặt thành công!",
              },
            });
          } else {
            throw new Error("Không thể tạo đơn hàng");
          }
        } catch (error) {
          console.error("Lỗi khi tạo đơn hàng:", error);
          setError(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
          toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
        }
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      setError(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
      toast.error(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm useEffect để kiểm tra trạng thái đơn hàng sau khi thanh toán
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = localStorage.getItem("orderId");
      const isReturningFromPayment = localStorage.getItem(
        "isReturningFromPayment"
      );

      if (!orderId || !isReturningFromPayment) return;

      console.log("Checking payment status for order:", orderId);

      try {
        const response = await axios.get(`/api/momo/status/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Payment status response:", response.data);

        if (response.data.success) {
          const { paymentStatus, orderStatus } = response.data.data;

          if (paymentStatus === "PAID" && orderStatus === "PROCESSING") {
            // Thanh toán thành công
            console.log("Payment successful, redirecting to thank you page");
            toast.success("Thanh toán thành công!");
            localStorage.removeItem("orderId");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("isReturningFromPayment");
            navigate("/thank-you", {
              state: {
                order: response.data.data,
                message: "Đơn hàng của bạn đã được thanh toán thành công!",
              },
            });
          } else if (paymentStatus === "FAILED") {
            // Thanh toán thất bại
            console.log("Payment failed");
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            localStorage.removeItem("orderId");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("isReturningFromPayment");
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };

    // Kiểm tra trạng thái mỗi 3 giây
    const interval = setInterval(checkPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Thêm useEffect để kiểm tra khi quay lại từ trang thanh toán MoMo
  useEffect(() => {
    const checkReturnFromPayment = async () => {
      const momoOrderId = localStorage.getItem("momoOrderId");
      const isReturning = localStorage.getItem("isReturningFromPayment");

      if (momoOrderId && isReturning === "true") {
        try {
          console.log("Checking order status for:", momoOrderId);
          const response = await axios.get(
            `http://localhost:4000/api/momo/status/${momoOrderId}`
          );

          if (response.data.success) {
            const { paymentStatus, orderStatus } = response.data.data;

            if (paymentStatus === "PAID" && orderStatus === "PROCESSING") {
              toast.success("Thanh toán thành công!");
              localStorage.removeItem("momoOrderId");
              localStorage.removeItem("isReturningFromPayment");
              navigate("/thank-you");
            } else if (
              paymentStatus === "FAILED" ||
              orderStatus === "CANCELLED"
            ) {
              toast.error("Thanh toán thất bại. Vui lòng thử lại.");
              localStorage.removeItem("momoOrderId");
              localStorage.removeItem("isReturningFromPayment");
            }
          }
        } catch (error) {
          console.error(
            "Lỗi khi kiểm tra trạng thái thanh toán sau khi quay lại:",
            error
          );
          if (error.response?.status === 404) {
            toast.error("Không tìm thấy đơn hàng. Vui lòng thử lại.");
            localStorage.removeItem("momoOrderId");
            localStorage.removeItem("isReturningFromPayment");
          }
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkReturnFromPayment();
  }, [navigate]);

  // Xử lý thanh toán MoMo
  const handleMomoPayment = async () => {
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          image: item.product.images?.[0] || "",
          description: item.product.description,
        })),
        totalAmount: calculateTotal(),
        userId: user._id,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.cityName,
          district: formData.districtName,
          ward: formData.wardName,
        },
        note: note,
        paymentMethod: "MOMO",
      };

      console.log("Sending order data:", orderData);

      const response = await axios.post(
        "/api/momo/create",
        { orderData },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          baseURL: "http://localhost:4000",
        }
      );

      console.log("MoMo API response:", response.data);

      if (response.data.success) {
        // Lưu momoOrderId vào localStorage
        localStorage.setItem("momoOrderId", response.data.data.momoOrderId);
        localStorage.setItem("isReturningFromPayment", "true");

        // Chuyển hướng đến trang thanh toán MoMo
        window.location.href = response.data.data.payUrl;
      } else {
        toast.error(response.data.message || "Lỗi khi tạo thanh toán");
      }
    } catch (error) {
      console.error("Error in handleMomoPayment:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi tạo thanh toán MoMo"
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải thông tin...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Shipping Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <IoLocationSharp /> Thông tin giao hàng
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Tỉnh/Thành phố"
                      name="city"
                      value={formData.city}
                      onChange={handleProvinceChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                    >
                      <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                      {provinces.map((province) => (
                        <MenuItem key={province.code} value={province.code}>
                          {province.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Quận/Huyện"
                      name="district"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      error={!!errors.district}
                      helperText={errors.district}
                      disabled={!formData.city}
                      required
                    >
                      <MenuItem value="">Chọn quận/huyện</MenuItem>
                      {districts.map((district) => (
                        <MenuItem key={district.code} value={district.code}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Phường/Xã"
                      name="ward"
                      value={formData.ward}
                      onChange={handleWardChange}
                      error={!!errors.ward}
                      helperText={errors.ward}
                      disabled={!formData.district}
                      required
                    >
                      <MenuItem value="">Chọn phường/xã</MenuItem>
                      {wards.map((ward) => (
                        <MenuItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    <IoCardSharp /> Phương thức thanh toán
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          border:
                            paymentMethod === "COD"
                              ? "2px solid #00aaff"
                              : "1px solid #ddd",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#00aaff",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => setPaymentMethod("COD")}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <FaMoneyBillWave
                              size={24}
                              color={
                                paymentMethod === "COD" ? "#00aaff" : "#666"
                              }
                            />
                            <Typography
                              variant="h6"
                              sx={{
                                ml: 1,
                                color:
                                  paymentMethod === "COD"
                                    ? "#00aaff"
                                    : "inherit",
                              }}
                            >
                              COD
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Thanh toán khi nhận hàng
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          border:
                            paymentMethod === "MOMO"
                              ? "2px solid #00aaff"
                              : "1px solid #ddd",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#00aaff",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => setPaymentMethod("MOMO")}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <FaWallet
                              size={24}
                              color={
                                paymentMethod === "MOMO" ? "#00aaff" : "#666"
                              }
                            />
                            <Typography
                              variant="h6"
                              sx={{
                                ml: 1,
                                color:
                                  paymentMethod === "MOMO"
                                    ? "#00aaff"
                                    : "inherit",
                              }}
                            >
                              MoMo
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Thanh toán qua ví MoMo
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    <IoCardSharp /> Ghi chú đơn hàng
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Giao hàng trong giờ hành chính, gọi điện trước khi giao,..."
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": {
                            borderColor: "#00aaff",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#00aaff",
                          },
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      * Thêm ghi chú để chúng tôi phục vụ bạn tốt hơn
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#00aaff" }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{ mr: 1, color: "white" }}
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            <Divider sx={{ my: 2 }} />
            {cartItems.map((item) => (
              <Box key={item.product._id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <img
                      src={item.product.images?.[0] || ""}
                      alt={item.product.name}
                      style={{ width: "100%", borderRadius: "4px" }}
                    />
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="subtitle1">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giá: {item.price.toLocaleString("vi-VN")}đ
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thành tiền:{" "}
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="red">
                {calculateTotal().toLocaleString("vi-VN")}đ
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
