import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Button,
  Container,
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order);
    } else {
      navigate("/");
    }
  }, [location, navigate]);

  if (!order) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" color="primary" gutterBottom>
            Cảm ơn bạn đã đặt hàng!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mã đơn hàng của bạn là: {order._id}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {order.items.map((item, index) => (
              <Box key={index} mb={2}>
                <Typography variant="body1">
                  {item.product.name} x {item.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatPrice(item.price)}
                </Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">
              Tổng tiền: {formatPrice(order.totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Phương thức thanh toán:{" "}
              {order.paymentMethod === "COD"
                ? "Thanh toán khi nhận hàng"
                : "Momo"}
            </Typography>
          </Grid>

          {/* Thông tin giao hàng */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1">
              {order.shippingAddress.fullName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.phone}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.address}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.city}
            </Typography>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Về trang chủ
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ThankYou;
