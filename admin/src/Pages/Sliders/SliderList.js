import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import EditSliderDialog from "./EditSliderDialog";
import { useTheme } from "../../context/ThemeContext";

const SliderList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    sliderId: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    sliderId: null,
  });

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const data = await fetchDataFromApi("/api/sliders");
      setSliders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sliders:", error);
      toast.error("Lỗi khi tải danh sách slider");
      setLoading(false);
    }
  };

  const handleEditClick = (id) => {
    setEditDialog({
      open: true,
      sliderId: id,
    });
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      sliderId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData("/api/sliders/", deleteDialog.sliderId);
      toast.success("Xóa slider thành công");
      fetchSliders();
    } catch (error) {
      console.error("Error deleting slider:", error);
      toast.error("Lỗi khi xóa slider");
    } finally {
      setDeleteDialog({
        open: false,
        sliderId: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      sliderId: null,
    });
  };

  const handleEditClose = () => {
    setEditDialog({
      open: false,
      sliderId: null,
    });
  };

  const handleEditSuccess = () => {
    fetchSliders();
  };

  // Styles for dark mode
  const tableContainerStyle = {
    backgroundColor: isDarkMode ? "#1a2035" : "#fff",
    boxShadow: isDarkMode
      ? "0 4px 20px 0 rgba(0, 0, 0, 0.5)"
      : "0 4px 20px 0 rgba(0, 0, 0, 0.1)",
  };

  const tableHeadStyle = {
    backgroundColor: isDarkMode ? "#131929" : "#f5f5f5",
    "& .MuiTableCell-head": {
      color: isDarkMode ? "#fff" : "#333",
      fontWeight: "bold",
    },
  };

  const tableCellStyle = {
    color: isDarkMode ? "#fff" : "inherit",
    borderBottomColor: isDarkMode
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(224, 224, 224, 1)",
  };

  const dialogStyle = {
    "& .MuiDialog-paper": {
      backgroundColor: isDarkMode ? "#1a2035" : "#fff",
      color: isDarkMode ? "#fff" : "#000",
    },
  };

  const dialogContentStyle = {
    color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
  };

  if (loading) {
    return (
      <Typography sx={{ color: isDarkMode ? "#fff" : "#000" }}>
        Đang tải...
      </Typography>
    );
  }

  return (
    <Box sx={{ color: isDarkMode ? "#fff" : "#000" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h4" sx={{ color: isDarkMode ? "#fff" : "#000" }}>
          Quản lý Slider
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Trang chủ
            </Link>
            <span className="separator">~</span>
            <Link to="/sliders" className="breadcrumb-link">
              Slider
            </Link>
          </div>
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#00aaff",
            "&:hover": {
              backgroundColor: "#0088cc",
            },
          }}
          component={Link}
          to="/sliders/slider-add"
        >
          Thêm Slider
        </Button>
      </Box>

      <TableContainer component={Paper} sx={tableContainerStyle}>
        <Table>
          <TableHead sx={tableHeadStyle}>
            <TableRow>
              <TableCell sx={tableCellStyle}>STT</TableCell>
              <TableCell sx={tableCellStyle}>Ảnh</TableCell>
              <TableCell sx={tableCellStyle}>Tên</TableCell>
              <TableCell sx={tableCellStyle}>Mô tả</TableCell>
              <TableCell sx={tableCellStyle}>Thứ tự</TableCell>
              <TableCell sx={tableCellStyle}>Trạng thái</TableCell>
              <TableCell align="center" sx={tableCellStyle}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sliders.map((slider, index) => (
              <TableRow
                key={slider._id}
                sx={{
                  "&:hover": {
                    backgroundColor: isDarkMode
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <TableCell sx={tableCellStyle}>{index + 1}</TableCell>
                <TableCell sx={tableCellStyle}>
                  <Box
                    sx={{
                      border: `1px solid ${
                        isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.1)"
                      }`,
                      borderRadius: "4px",
                      overflow: "hidden",
                      width: 80,
                      height: 50,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={slider.image}
                      alt={slider.name}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell sx={tableCellStyle}>{slider.name}</TableCell>
                <TableCell sx={tableCellStyle}>{slider.description}</TableCell>
                <TableCell sx={tableCellStyle}>{slider.order}</TableCell>
                <TableCell sx={tableCellStyle}>
                  <Box
                    sx={{
                      backgroundColor: isDarkMode
                        ? slider.isActive
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(198, 40, 40, 0.2)"
                        : slider.isActive
                        ? "#e8f5e9"
                        : "#ffebee",
                      color: isDarkMode
                        ? slider.isActive
                          ? "#81c784"
                          : "#ef9a9a"
                        : slider.isActive
                        ? "#2e7d32"
                        : "#c62828",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-block",
                    }}
                  >
                    {slider.isActive ? "Hoạt động" : "Ẩn"}
                  </Box>
                </TableCell>
                <TableCell align="center" sx={tableCellStyle}>
                  <IconButton
                    sx={{
                      color: isDarkMode ? "#90caf9" : "#1976d2",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(144, 202, 249, 0.08)"
                          : "rgba(25, 118, 210, 0.04)",
                      },
                    }}
                    onClick={() => handleEditClick(slider._id)}
                    title="Chỉnh sửa"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: isDarkMode ? "#f48fb1" : "#d32f2f",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(244, 143, 177, 0.08)"
                          : "rgba(211, 47, 47, 0.04)",
                      },
                    }}
                    onClick={() => handleDeleteClick(slider._id)}
                    title="Xóa"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {sliders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={tableCellStyle}>
                  Không có dữ liệu slider
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={dialogStyle}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ color: isDarkMode ? "#fff" : "#000" }}
        >
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={dialogContentStyle}
          >
            Bạn có chắc chắn muốn xóa slider này? Hành động này không thể hoàn
            tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            sx={{ color: isDarkMode ? "rgba(255, 255, 255, 0.7)" : undefined }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              color: isDarkMode ? "#f48fb1" : "#d32f2f",
            }}
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chỉnh sửa */}
      <EditSliderDialog
        open={editDialog.open}
        onClose={handleEditClose}
        sliderId={editDialog.sliderId}
        onSuccess={handleEditSuccess}
      />
    </Box>
  );
};

export default SliderList;
