import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Button,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderDetail, cancelOrder } from "../../services/api";
import { toast } from "react-hot-toast";

const OrderDetail = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      const response = await getOrderDetail(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        toast.error("Không thể tải thông tin đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const response = await cancelOrder(orderId);
      if (response.success) {
        toast.success("Hủy đơn hàng thành công");
        fetchOrderDetail(); // Tải lại thông tin đơn hàng
      } else {
        toast.error(response.message || "Không thể hủy đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi hủy đơn hàng");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "shipped":
        return "primary";
      case "delivered":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Không tìm thấy đơn hàng
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/orders")}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Chi tiết đơn hàng</Typography>
        <Button variant="outlined" onClick={() => navigate("/orders")}>
          Quay lại
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin đơn hàng
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">Mã đơn hàng: {order._id}</Typography>
              <Typography variant="body1">
                Ngày đặt: {formatDate(order.createdAt)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" sx={{ mr: 1 }}>
                  Trạng thái:
                </Typography>
                <Chip
                  label={getStatusText(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Sản phẩm
            </Typography>
            {order.items.map((item) => {
              // Log toàn bộ item để debug
              console.log("Full item data:", item);

              let productImage = null;

              // Kiểm tra và lấy ảnh theo thứ tự ưu tiên
              if (item.product?.images?.length > 0) {
                productImage = item.product.images[0];
              } else if (item.product?.image) {
                productImage = item.product.image;
              } else if (item.images?.length > 0) {
                productImage = item.images[0];
              } else if (item.image) {
                productImage = item.image;
              }

              // Log để debug
              console.log("Image selection process:", {
                itemId: item._id,
                productImages: item.product?.images,
                productImage: item.product?.image,
                itemImages: item.images,
                itemImage: item.image,
                finalSelectedImage: productImage,
              });

              // Nếu không có ảnh, sử dụng ảnh mặc định
              const defaultImage =
                "https://res.cloudinary.com/dy81ccuzq/image/upload/v1/products/no-image.png";
              const imageUrl = productImage || defaultImage;

              return (
                <Box key={item._id} sx={{ mb: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <Box
                        sx={{
                          width: "100%",
                          position: "relative",
                          paddingTop: "100%",
                          bgcolor: "grey.100",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={item.name || "Sản phẩm"}
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            p: 1,
                          }}
                          onError={(e) => {
                            if (e.target.src !== defaultImage) {
                              e.target.src = defaultImage;
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={9}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {item.product?.name}
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
              );
            })}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin giao hàng
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Người nhận: {order.shippingAddress.fullName}
              </Typography>
              <Typography variant="body1">
                Số điện thoại: {order.shippingAddress.phone}
              </Typography>
              <Typography variant="body1">
                Địa chỉ: {order.shippingAddress.address},{" "}
                {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
                {order.shippingAddress.city}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Thanh toán
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1">
                Phương thức:{" "}
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Thanh toán MOMO"}
              </Typography>
              <Typography variant="body1">
                Tổng tiền: {order.totalAmount.toLocaleString("vi-VN")}đ
              </Typography>
            </Box>

            {order.status === "pending" && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleCancelOrder}
              >
                Hủy đơn hàng
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetail;
