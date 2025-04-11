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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp, IoCardSharp } from "react-icons/io5";
import { FaMoneyBillWave, FaWallet } from "react-icons/fa";
import {
  createOrderFromCart,
  clearCart,
  getCart,
  api,
} from "../../services/api";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    paymentMethod: "COD",
    note: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Lấy dữ liệu giỏ hàng
    const fetchCart = async () => {
      try {
        const response = await getCart();
        setCartItems(response.items || []);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city) newErrors.city = "Vui lòng nhập thành phố";
    if (!formData.district) newErrors.district = "Vui lòng nhập quận/huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng nhập phường/xã";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Kiểm tra dữ liệu trước khi gửi
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
        },
        paymentMethod: paymentMethod,
        note: note,
      };

      if (paymentMethod === "MOMO") {
        try {
          const total = calculateTotal();
          console.log("Số tiền thanh toán:", total);

          // Gọi API tạo thanh toán MOMO
          const momoResponse = await api.post("/momo/create", {
            amount: Math.round(total),
            orderInfo: `Thanh toan don hang cho ${formData.fullName}`,
          });

          console.log("MOMO Response:", momoResponse);

          if (momoResponse.success && momoResponse.data?.payUrl) {
            // Lưu thông tin đơn hàng vào localStorage để sử dụng sau khi thanh toán
            localStorage.setItem(
              "pendingOrder",
              JSON.stringify({
                ...orderData,
                momoOrderId: momoResponse.data.orderId,
              })
            );

            // Chuyển hướng đến trang thanh toán MOMO
            toast.success("Đang chuyển đến trang thanh toán MOMO...");
            window.location.href = momoResponse.data.payUrl;
            return;
          } else {
            throw new Error(
              momoResponse.message || "Không thể tạo thanh toán MOMO"
            );
          }
        } catch (error) {
          console.error("Lỗi khi tạo thanh toán MOMO:", error);
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Không thể tạo thanh toán MOMO. Vui lòng thử lại sau."
          );
          setError("Không thể tạo thanh toán MOMO. Vui lòng thử lại sau.");
          setLoading(false);
          return;
        }
      }

      // Nếu là COD hoặc các phương thức khác
      const response = await createOrderFromCart(orderData);
      console.log("Response from server:", response);

      if (response.success && response.data) {
        navigate("/thank-you", {
          state: {
            order: response.data,
            message: response.message,
          },
        });
      } else {
        setError(response.message || "Có lỗi xảy ra khi tạo đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo đơn hàng"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thanh toán
      </Typography>

      <Grid container spacing={4}>
        {/* Thông tin giao hàng */}
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Thành phố"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quận/Huyện"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    error={!!errors.district}
                    helperText={errors.district}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phường/Xã"
                    name="ward"
                    value={formData.ward}
                    onChange={handleChange}
                    error={!!errors.ward}
                    helperText={errors.ward}
                  />
                </Grid>
                <Box sx={{ mt: 4 }}>
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
                              Momo
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Thanh toán qua ví Momo
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
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
                      InputProps={{
                        sx: {
                          fontSize: "0.9rem",
                          "&::placeholder": {
                            fontSize: "0.9rem",
                            fontStyle: "italic",
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
                  disabled={loading}
                  style={{ backgroundColor: "#00aaff" }}
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tóm tắt đơn hàng */}
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
              <Typography variant="h6" color="primary">
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
