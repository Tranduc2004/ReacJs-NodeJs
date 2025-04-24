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
  Rating,
  Card,
  CardContent,
  Avatar,
  Chip,
} from "@mui/material";
import {
  Home as HomeIcon,
  CheckCircle,
  LocalShipping,
  Payment,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
  borderRadius: "20px",
  boxShadow: "0 10px 30px rgba(0, 170, 255, 0.1)",
  padding: theme.spacing(4),
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "4px",
    background: "#00aaff",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "15px",
  boxShadow: "0 5px 15px rgba(0, 170, 255, 0.1)",
  transition: "transform 0.3s ease",
  height: "100%", // Đảm bảo các card có chiều cao bằng nhau
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: "#00aaff",
  color: "white",
  fontWeight: "bold",
  padding: theme.spacing(0.5, 1.5),
  borderRadius: "16px",
  fontSize: "0.9rem",
}));

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Lấy dữ liệu order từ state hoặc fetch nếu cần
    if (location.state?.order) {
      console.log("Order from location state:", location.state.order);
      setOrder(location.state.order);
    } else {
      // Tùy chọn: Fetch dữ liệu đơn hàng dựa trên ID từ URL nếu có
      // const orderId = new URLSearchParams(location.search).get('orderId');
      // if (orderId) { fetchOrder(orderId); } else { navigate('/'); }
      console.warn(
        "Order data not found in location state, redirecting to home."
      );
      navigate("/");
    }
  }, [location, navigate]);

  if (!order) {
    return null; // Hoặc hiển thị loading indicator
  }

  console.log("Rendering ThankYou page with order:", order);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0); // Thêm fallback cho giá trị null/undefined
  };

  // Xác định trạng thái đơn hàng để hiển thị
  const getOrderStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPED":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao hàng";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
      <StyledPaper>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              bgcolor: "#00aaff",
              width: { xs: 60, md: 80 },
              height: { xs: 60, md: 80 },
              margin: "0 auto 20px",
            }}
          >
            <CheckCircle sx={{ fontSize: { xs: 35, md: 50 } }} />
          </Avatar>
          <Typography
            variant="h4"
            color="#00aaff"
            gutterBottom
            fontWeight="bold"
          >
            Cảm ơn bạn đã đặt hàng!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Mã đơn hàng của bạn là:{" "}
            <Typography component="span" color="#00aaff" fontWeight="bold">
              {order._id}
            </Typography>
          </Typography>
          {order.status && (
            <StatusChip
              label={getOrderStatusText(order.status)}
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={7}>
            <StyledCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Payment sx={{ color: "#00aaff", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Chi tiết đơn hàng
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <Box key={item.product?._id || index} mb={2}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3} sm={2}>
                          <Avatar
                            variant="rounded"
                            src={item.image || item.product?.image}
                            alt={item.name || item.product?.name}
                            sx={{ width: 56, height: 56 }}
                          />
                        </Grid>
                        <Grid item xs={9} sm={10}>
                          <Typography variant="body1" fontWeight="medium">
                            {item.name || item.product?.name || "Sản phẩm"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              mb: 0.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Rating
                              value={item.product?.rating || 0}
                              precision={0.5}
                              readOnly
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ({item.product?.numReviews || 0})
                            </Typography>
                          </Box>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            flexWrap="wrap"
                          >
                            <Typography variant="body2" color="text.secondary">
                              SL: {item.quantity}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="#00aaff"
                              fontWeight="bold"
                            >
                              {formatPrice(item.price)}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      {index < order.items.length - 1 && (
                        <Divider sx={{ my: 2 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography>Không có sản phẩm nào trong đơn hàng.</Typography>
                )}
              </CardContent>
              <Divider />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body1" color="#00aaff" fontWeight="bold">
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Momo"}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="h6" color="#00aaff" fontWeight="bold">
                    {formatPrice(order.totalAmount)}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Thông tin giao hàng */}
          <Grid item xs={12} md={5}>
            <StyledCard>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocalShipping sx={{ color: "#00aaff", mr: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    Thông tin giao hàng
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {order.shippingAddress ? (
                  <Box sx={{ "& > *": { mb: 1 } }}>
                    <Typography variant="body1" fontWeight="medium">
                      {order.shippingAddress.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress.phone}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.shippingAddress.ward},{" "}
                      {order.shippingAddress.district},{" "}
                      {order.shippingAddress.city}
                    </Typography>
                    {order.note && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          <span style={{ fontWeight: "bold" }}>Ghi chú:</span>{" "}
                          {order.note}
                        </Typography>
                      </>
                    )}
                  </Box>
                ) : (
                  <Typography>Không có thông tin giao hàng.</Typography>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={5}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#00aaff",
              "&:hover": {
                backgroundColor: "#0099ee",
              },
              borderRadius: "25px",
              padding: "10px 30px",
              fontSize: "1rem",
              textTransform: "none",
            }}
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default ThankYou;
