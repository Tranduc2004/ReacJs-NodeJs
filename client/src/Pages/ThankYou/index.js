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
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import {
  Home as HomeIcon,
  CheckCircle,
  LocalShipping,
  Payment,
  ShoppingCart,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const GradientPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
  borderRadius: 24,
  boxShadow: "0 8px 32px 0 rgba(0,170,255,0.10)",
  padding: theme.spacing(5, 4),
  position: "relative",
  overflow: "hidden",
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "1rem",
  padding: theme.spacing(0.5, 2),
  borderRadius: 16,
  background: "#00aaff",
  color: "#fff",
  letterSpacing: 1,
  boxShadow: "0 2px 8px rgba(0,170,255,0.08)",
}));

const ProductAvatar = styled(Avatar)({
  width: 64,
  height: 64,
  borderRadius: 12,
  background: "#f5f5f5",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
});

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

  if (!order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

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
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <GradientPaper>
        <Box textAlign="center" mb={4}>
          <Avatar
            sx={{
              bgcolor: "#00aaff",
              width: { xs: 70, md: 90 },
              height: { xs: 70, md: 90 },
              margin: "0 auto 20px",
              boxShadow: "0 4px 16px rgba(0,170,255,0.15)",
            }}
          >
            <CheckCircle sx={{ fontSize: { xs: 40, md: 60 } }} />
          </Avatar>
          <Typography
            variant="h4"
            color="#00aaff"
            gutterBottom
            fontWeight="bold"
            sx={{ letterSpacing: 1 }}
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
              icon={<ShoppingCart />}
            />
          )}
        </Box>

        <Grid container spacing={4}>
          {/* Thông tin đơn hàng */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                background: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,170,255,0.06)",
                p: 3,
                height: "100%",
              }}
            >
              <Box display="flex" alignItems="center" mb={2}>
                <Payment sx={{ color: "#00aaff", mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Chi tiết đơn hàng
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    const discount =
                      typeof item.discount === "number"
                        ? item.discount
                        : item.product?.discount || 0;
                    const price = item.price || item.product?.price || 0;
                    return (
                      <Box key={item.product?._id || index}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={3} sm={2}>
                            <ProductAvatar
                              variant="rounded"
                              src={item.image || item.product?.image}
                              alt={item.name || item.product?.name}
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
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                SL: {item.quantity}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="#00aaff"
                                fontWeight="bold"
                              >
                                {discount > 0 ? (
                                  <>
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        color: "#888",
                                        marginRight: 4,
                                      }}
                                    >
                                      {formatPrice(price)}
                                    </span>
                                    <span
                                      style={{
                                        color: "#ed174a",
                                        fontWeight: 600,
                                      }}
                                    >
                                      {formatPrice(
                                        price * (1 - discount / 100)
                                      )}
                                    </span>
                                  </>
                                ) : (
                                  <span>{formatPrice(price)}</span>
                                )}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        {index < order.items.length - 1 && (
                          <Divider sx={{ my: 2 }} />
                        )}
                      </Box>
                    );
                  })
                ) : (
                  <Typography>Không có sản phẩm nào trong đơn hàng.</Typography>
                )}
              </Stack>
              <Divider sx={{ my: 2 }} />
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
            </Box>
          </Grid>

          {/* Thông tin giao hàng */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                background: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,170,255,0.06)",
                p: 3,
                height: "100%",
              }}
            >
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
            </Box>
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
              boxShadow: "0 4px 16px rgba(0,170,255,0.10)",
            }}
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Tiếp tục mua sắm
          </Button>
        </Box>
      </GradientPaper>
    </Container>
  );
};

export default ThankYou;
