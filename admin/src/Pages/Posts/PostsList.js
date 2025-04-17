import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getData, deleteData } from "../../utils/api";
import { toast } from "react-toastify";

const PostsList = () => {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    postId: null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getData("/api/posts");
      setPosts(response);
      toast.success("Tải danh sách bài viết thành công");
    } catch (error) {
      console.error("Lỗi khi tải danh sách bài viết:", error);
      toast.error("Lỗi khi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({
      open: true,
      postId: id,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteData(`/api/posts/${deleteDialog.postId}`);
      toast.success("Xóa bài viết thành công");
      fetchPosts();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa bài viết"
      );
    } finally {
      setDeleteDialog({ open: false, postId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, postId: null });
  };

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "#0f1824" : "#f5f5f5",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          border: "none",
          p: 4,
          minHeight: "calc(100vh - 24px)",
        }}
      >
        <div className="header">
          <h1>Quản lý bài viết</h1>
          <div className="breadcrumbs">
            <Link to="/" className="breadcrumb-link">
              Home
            </Link>
            <span className="separator">~</span>
            <Link to="/posts" className="breadcrumb-link">
              Bài viết
            </Link>
          </div>
        </div>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6">Danh sách bài viết</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            component={Link}
            to="/posts/post-add"
            onClick={() => toast.info("Đang chuyển đến trang thêm bài viết")}
          >
            Thêm bài viết
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Hình ảnh</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post._id}>
                  <TableCell>{post.title}</TableCell>
                  <TableCell>
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{post.tags.join(", ")}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      component={Link}
                      to={`/posts/post-edit/${post._id}`}
                      onClick={() =>
                        toast.info("Đang chuyển đến trang chỉnh sửa bài viết")
                      }
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(post._id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: isDarkMode ? "#1a2035" : "#fff",
          },
        }}
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
            sx={{ color: isDarkMode ? "#fff" : "#000" }}
          >
            Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn
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
    </Box>
  );
};

export default PostsList;
