import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
} from "@mui/material";
import { Visibility, Edit } from "@mui/icons-material";
import { toast } from "react-hot-toast";
import { fetchAllOrdersApi, editData } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      toast.loading("Đang tải danh sách đơn hàng...");
      const response = await fetchAllOrdersApi();
      if (response.success) {
        toast.dismiss();
        setOrders(response.data);
      } else {
        toast.dismiss();
        toast.error("Không thể tải danh sách đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      toast.dismiss();
      toast.error("Có lỗi xảy ra khi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      toast.loading("Đang cập nhật trạng thái...");
      const response = await editData(
        `/api/admin/orders/${selectedOrder._id}/status`,
        {
          status: newStatus,
          note: statusNote,
        }
      );
      if (response.success) {
        toast.dismiss();
        toast.success("Cập nhật trạng thái đơn hàng thành công");
        setOpenEditDialog(false);
        fetchOrders();
      } else {
        toast.dismiss();
        toast.error("Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.dismiss();
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "#b26a00", backgroundColor: "#fff3cd" }; // vàng
      case "PROCESSING":
        return { color: "#1976d2", backgroundColor: "#e3f2fd" }; // xanh dương
      case "SHIPPED":
        return { color: "#6f42c1", backgroundColor: "#ede7f6" }; // tím
      case "DELIVERED":
        return { color: "#388e3c", backgroundColor: "#e8f5e9" }; // xanh lá
      case "CANCELLED":
        return { color: "#d32f2f", backgroundColor: "#ffebee" }; // đỏ
      default:
        return { color: "#757575", backgroundColor: "#f5f5f5" }; // xám
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

  return (
    <Box
      sx={{
        backgroundColor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        p: 3,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: isDarkMode ? "#fff" : "#1a1a1a",
          mb: 3,
        }}
      >
        Quản lý đơn hàng
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Mã đơn hàng
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Khách hàng
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Ngày đặt
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Tổng tiền
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order._id}>
                <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  {order._id}
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  {order.user?.name || "Không có thông tin"}
                  <br />
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDarkMode
                        ? "rgba(255, 255, 255, 0.7)"
                        : "rgba(0, 0, 0, 0.6)",
                    }}
                  >
                    {order.user?.email}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                  {order.totalAmount
                    ? order.totalAmount.toLocaleString("vi-VN")
                    : "0"}
                  đ
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
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpenDetailDialog(true);
                    }}
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                    className="edit-btn"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setStatusNote("");
                      setOpenEditDialog(true);
                    }}
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                    className="delete-btn"
                  >
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog xem chi tiết đơn hàng */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#0f1824" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
          },
        }}
      >
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Thông tin khách hàng
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Tên: {selectedOrder.shippingAddress.fullName}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    SĐT: {selectedOrder.shippingAddress.phone}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Địa chỉ: {selectedOrder.shippingAddress.address},{" "}
                    {selectedOrder.shippingAddress.ward},{" "}
                    {selectedOrder.shippingAddress.district},{" "}
                    {selectedOrder.shippingAddress.city}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                  >
                    Thông tin đơn hàng
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Phương thức thanh toán:{" "}
                    {selectedOrder.paymentMethod === "COD"
                      ? "Thanh toán khi nhận hàng"
                      : "Thanh toán MOMO"}
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Tổng tiền:{" "}
                    {selectedOrder.totalAmount
                      ? selectedOrder.totalAmount.toLocaleString("vi-VN")
                      : "0"}
                    đ
                  </Typography>
                  <Typography sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
                    Trạng thái:{" "}
                    <Chip
                      label={getStatusText(selectedOrder.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        ...getStatusColor(selectedOrder.status),
                      }}
                    />
                  </Typography>
                </Grid>
              </Grid>

              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 2, color: isDarkMode ? "#fff" : "#1a1a1a" }}
              >
                Sản phẩm
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Tên sản phẩm
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Số lượng
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Đơn giá
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                      >
                        Thành tiền
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell
                          sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                        >
                          <Box display="flex" alignItems="center">
                            {item.product?.images?.[0] && (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                style={{
                                  width: 50,
                                  height: 50,
                                  marginRight: 10,
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                            {item.product?.name}
                          </Box>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                        >
                          {item.quantity}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                        >
                          {item.product?.price
                            ? item.product.price.toLocaleString("vi-VN")
                            : "0"}
                          đ
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
                        >
                          {item.product?.price && item.quantity
                            ? (
                                item.product.price * item.quantity
                              ).toLocaleString("vi-VN")
                            : "0"}
                          đ
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDetailDialog(false)}
            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cập nhật trạng thái */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: isDarkMode ? "#0f1824" : "#fff",
            color: isDarkMode ? "#fff" : "#1a1a1a",
          },
        }}
      >
        <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}>
              Trạng thái
            </InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Trạng thái"
              sx={{
                color: isDarkMode ? "#fff" : "#1a1a1a",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : "rgba(0, 0, 0, 0.23)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
              }}
            >
              <MenuItem value="PENDING">Chờ xác nhận</MenuItem>
              <MenuItem value="PROCESSING">Đang xử lý</MenuItem>
              <MenuItem value="SHIPPED">Đang giao hàng</MenuItem>
              <MenuItem value="DELIVERED">Đã giao hàng</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="Ghi chú"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            sx={{
              "& .MuiInputLabel-root": {
                color: isDarkMode ? "#fff" : "#1a1a1a",
              },
              "& .MuiOutlinedInput-root": {
                color: isDarkMode ? "#fff" : "#1a1a1a",
                "& fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : "rgba(0, 0, 0, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: isDarkMode
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(0, 0, 0, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: isDarkMode ? "#fff" : "#1a1a1a",
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditDialog(false)}
            sx={{ color: isDarkMode ? "#fff" : "#1a1a1a" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            sx={{
              backgroundColor: "#0858f7",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#0646c6",
              },
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
