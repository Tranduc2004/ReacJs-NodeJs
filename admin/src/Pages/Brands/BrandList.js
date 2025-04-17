import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

const BrandList = () => {
  const { isDarkMode } = useTheme();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    brandId: null,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await fetchDataFromApi("/api/brands");
      setBrands(data);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải danh sách thương hiệu");
      setLoading(false);
      console.error("Lỗi khi tải thương hiệu:", err);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      brandId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData(`/api/brands/${deleteDialog.brandId}`);
      toast.success("Xóa thương hiệu thành công");
      fetchBrands();
    } catch (err) {
      console.error("Lỗi khi xóa thương hiệu:", err);
      toast.error("Không thể xóa thương hiệu");
    } finally {
      setDeleteDialog({
        open: false,
        brandId: null,
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      brandId: null,
    });
  };

  // Styles for dark mode - sử dụng lại từ SliderList
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
          Quản lý Thương hiệu
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Trang chủ
            </Link>
            <span className="separator">~</span>
            <Link to="/brands" className="breadcrumb-link">
              Thương hiệu
            </Link>
          </div>
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: "#00aaff",
            "&:hover": {
              backgroundColor: "#0088cc",
            },
          }}
          component={Link}
          to="/brands/brand-add"
        >
          Thêm Thương hiệu
        </Button>
      </Box>

      {error && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: isDarkMode ? "rgba(198, 40, 40, 0.2)" : "#ffebee",
            color: isDarkMode ? "#ef9a9a" : "#c62828",
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography>{error}</Typography>
          <Button
            variant="outlined"
            onClick={fetchBrands}
            sx={{
              color: isDarkMode ? "#ef9a9a" : "#c62828",
              borderColor: isDarkMode ? "#ef9a9a" : "#c62828",
              "&:hover": {
                borderColor: isDarkMode ? "#ff8a80" : "#d32f2f",
                backgroundColor: isDarkMode
                  ? "rgba(239, 154, 154, 0.08)"
                  : "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Thử lại
          </Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={tableContainerStyle}>
        <Table>
          <TableHead sx={tableHeadStyle}>
            <TableRow>
              <TableCell sx={tableCellStyle}>Logo</TableCell>
              <TableCell sx={tableCellStyle}>Tên thương hiệu</TableCell>
              <TableCell sx={tableCellStyle}>Website</TableCell>
              <TableCell sx={tableCellStyle}>Trạng thái</TableCell>
              <TableCell align="center" sx={tableCellStyle}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.length > 0 ? (
              brands.map((brand) => (
                <TableRow
                  key={brand._id}
                  sx={{
                    "&:hover": {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
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
                        src={brand.logo}
                        alt={brand.name}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{brand.name}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: isDarkMode ? "#90caf9" : "#1976d2",
                        textDecoration: "none",
                      }}
                    >
                      {brand.website}
                    </a>
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    <Box
                      sx={{
                        backgroundColor: isDarkMode
                          ? brand.isActive
                            ? "rgba(46, 125, 50, 0.2)"
                            : "rgba(198, 40, 40, 0.2)"
                          : brand.isActive
                          ? "#e8f5e9"
                          : "#ffebee",
                        color: isDarkMode
                          ? brand.isActive
                            ? "#81c784"
                            : "#ef9a9a"
                          : brand.isActive
                          ? "#2e7d32"
                          : "#c62828",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "inline-block",
                      }}
                    >
                      {brand.isActive ? "Hoạt động" : "Không hoạt động"}
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
                      component={Link}
                      to={`/brands/brand-edit/${brand._id}`}
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
                      onClick={() => handleDeleteClick(brand._id)}
                      title="Xóa"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={tableCellStyle}>
                  Không có dữ liệu thương hiệu
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
            Bạn có chắc chắn muốn xóa thương hiệu này? Hành động này không thể
            hoàn tác.
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
    </Box>
  );
};

export default BrandList;
