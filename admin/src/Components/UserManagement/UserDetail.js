import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUserDetailApi } from "../../utils/api";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        const response = await fetchUserDetailApi(id);
        setUser(response);
      } catch (error) {
        toast.error("Không thể lấy thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 3, color: "text.primary" }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3, color: "text.primary" }}>
        <Typography>Không tìm thấy người dùng</Typography>
      </Box>
    );
  }

  // Thêm hàm đồng bộ trạng thái
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate("/users")}
          startIcon={<FaArrowLeft />}
          sx={{
            color: "primary.main",
            borderColor: "primary.main",
            "&:hover": {
              borderColor: "primary.dark",
              backgroundColor: "action.hover",
            },
          }}
        >
          Quay lại
        </Button>
      </Box>

      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "text.primary" }}>
          Thông tin người dùng
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Tên
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {user.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Email
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Số điện thoại
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {user.phone || "Chưa cập nhật"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Vai trò
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {user.role}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Trạng thái
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: user.isActive ? "success.main" : "error.main",
                backgroundColor: user.isActive
                  ? "success.lighter"
                  : "error.lighter",
                padding: "4px 8px",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Ngày tạo
            </Typography>
            <Typography variant="body1" sx={{ color: "text.primary" }}>
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        sx={{
          p: 3,
          backgroundColor: "background.paper",
          color: "text.primary",
          boxShadow: theme.shadows[1],
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ color: "text.primary" }}>
          Lịch sử đơn hàng
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Mã đơn hàng
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Ngày đặt
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Tổng tiền
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Phương thức thanh toán
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontWeight: "bold" }}>
                  Trạng thái
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.orders && user.orders.length > 0 ? (
                user.orders.map((order) => {
                  // Tính tổng tiền đã giảm
                  let discountedTotal = 0;
                  if (order.items && order.items.length > 0) {
                    order.items.forEach((item) => {
                      const price = item.price || item.product?.price || 0;
                      const discount =
                        typeof item.discount === "number"
                          ? item.discount
                          : item.product?.discount || 0;
                      const finalPrice =
                        discount > 0 ? price * (1 - discount / 100) : price;
                      discountedTotal += finalPrice * item.quantity;
                    });
                    discountedTotal = Math.round(discountedTotal);
                  } else {
                    discountedTotal = order.totalAmount;
                  }
                  return (
                    <TableRow
                      key={order._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <TableCell sx={{ color: "text.primary" }}>
                        {order._id}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {discountedTotal < order.totalAmount ? (
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
                              {discountedTotal.toLocaleString("vi-VN")}đ
                            </span>
                          </>
                        ) : (
                          <span>
                            {order.totalAmount.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: "text.primary" }}>
                        {order.paymentMethod === "COD"
                          ? "Thanh toán khi nhận hàng"
                          : "Momo"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(order.status)}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            ...getStatusColor(order.status),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ color: "text.secondary" }}
                  >
                    Chưa có đơn hàng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default UserDetail;
