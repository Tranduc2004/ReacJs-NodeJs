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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp, IoCardSharp } from "react-icons/io5";
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
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city) newErrors.city = "Vui lòng nhập thành phố";
    if (!formData.district) newErrors.district = "Vui lòng nhập quận/huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng nhập phường/xã";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        const orderData = {
          shippingAddress: {
            fullName: localStorage.getItem("user")?.name || "",
            phone: localStorage.getItem("user")?.phone || "",
            address: formData.address,
            city: formData.city,
            district: formData.district,
            ward: formData.ward,
          },
          paymentMethod: formData.paymentMethod,
          note: formData.note,
        };

        if (formData.paymentMethod === "MOMO") {
          try {
            // Kiểm tra giỏ hàng
            if (cartItems.length === 0) {
              throw new Error("Giỏ hàng trống");
            }

            // Tính tổng tiền
            const total = calculateTotal();
            if (!total || total <= 0) {
              throw new Error("Số tiền thanh toán không hợp lệ");
            }

            // Tạo đơn hàng và lấy thông tin thanh toán MOMO
            const response = await api.post("/momo/create", {
              amount: total.toString(), // Chuyển sang string
              orderInfo: `Thanh toán đơn hàng #${new Date().getTime()}`,
            });

            if (response.success && response.data?.payUrl) {
              // Lưu thông tin đơn hàng vào localStorage
              localStorage.setItem("pendingOrder", JSON.stringify(orderData));
              // Chuyển hướng đến trang thanh toán MOMO
              window.location.href = response.data.payUrl;
              return;
            } else {
              throw new Error("Không nhận được URL thanh toán từ MOMO");
            }
          } catch (error) {
            console.error("Lỗi khi tạo thanh toán MOMO:", error);
            // Nếu có lỗi khi tạo thanh toán MOMO, chuyển sang COD
            orderData.paymentMethod = "COD";
          }
        }

        // Nếu là COD hoặc thanh toán MOMO thất bại
        const orderResponse = await createOrderFromCart(orderData);
        if (orderResponse.success) {
          await clearCart();
          navigate("/orders");
        } else {
          throw new Error(orderResponse.message || "Lỗi khi tạo đơn hàng");
        }
      } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error);
        toast.error(error.message || "Có lỗi xảy ra khi tạo đơn hàng");
      } finally {
        setIsSubmitting(false);
      }
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
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
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
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <IoCardSharp /> Phương thức thanh toán
                  </Typography>
                  <TextField
                    fullWidth
                    select
                    label="Phương thức thanh toán"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="COD">Thanh toán khi nhận hàng</option>
                    <option value="MOMO">Thanh toán qua MOMO</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Ghi chú"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            </form>
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
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting || cartItems.length === 0}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Đặt hàng"}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
