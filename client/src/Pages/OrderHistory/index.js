import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";
import { getUserOrders } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getUserOrders();
      if (response.success) {
        setOrders(response.data);
      } else {
        toast.error("Không thể tải lịch sử đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử đơn hàng:", error);
      toast.error("Có lỗi xảy ra khi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "#b26a00", backgroundColor: "#fff3cd" };
      case "PROCESSING":
        return { color: "#1976d2", backgroundColor: "#e3f2fd" };
      case "SHIPPED":
        return { color: "#6f42c1", backgroundColor: "#ede7f6" };
      case "DELIVERED":
        return { color: "#388e3c", backgroundColor: "#e8f5e9" };
      case "CANCELLED":
        return { color: "#d32f2f", backgroundColor: "#ffebee" };
      default:
        return { color: "#757575", backgroundColor: "#f5f5f5" };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "PROCESSING":
        return "Đang xử lý";
      case "SHIPPED":
        return "Đang giao hàng";
      case "DELIVERED":
        return "Đã giao hàng";
      case "CANCELLED":
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

  // Hàm tính tổng tiền đã giảm cho đơn hàng
  const getDiscountedTotal = (order) => {
    if (!order.items || order.items.length === 0) return order.totalAmount;
    let discountedTotal = 0;
    order.items.forEach((item) => {
      const price = item.price || item.product?.price || 0;
      const discount =
        typeof item.discount === "number"
          ? item.discount
          : item.product?.discount || 0;
      const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
      discountedTotal += finalPrice * item.quantity;
    });
    return Math.round(discountedTotal);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Lịch sử đơn hàng
      </Typography>

      {orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1" gutterBottom>
            Bạn chưa có đơn hàng nào
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/products")}
            sx={{ mt: 2 }}
          >
            Mua sắm ngay
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Phương thức thanh toán</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    {/* Hiển thị giá đã giảm nếu có sản phẩm giảm giá */}
                    {(() => {
                      const discounted = getDiscountedTotal(order);
                      if (discounted < order.totalAmount) {
                        return (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#888",
                                marginRight: 4,
                              }}
                            >
                              {order.totalAmount.toLocaleString("vi-VN")}đ
                            </span>
                            <span style={{ color: "#ed174a", fontWeight: 600 }}>
                              {discounted.toLocaleString("vi-VN")}đ
                            </span>
                          </>
                        );
                      } else {
                        return (
                          <span>
                            {order.totalAmount.toLocaleString("vi-VN")}đ
                          </span>
                        );
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    {order.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Thanh toán MOMO"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(order.status)}
                      size="small"
                      sx={{ fontWeight: 600, ...getStatusColor(order.status) }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrderHistory;
