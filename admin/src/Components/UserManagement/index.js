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
  TablePagination,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  fetchUsersApi,
  toggleUserStatusApi,
  exportUsersExcelApi,
  updateUserApi,
  deleteUserApi,
} from "../../utils/api";
import { FaEye, FaEdit, FaTrash, FaBan, FaCheck } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
  });
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await fetchUsersApi(page, searchQuery);
      setUsers(data);
      setError(null);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
      setError("Không thể lấy danh sách người dùng");
      toast.error("Không thể lấy danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      await toggleUserStatusApi(userId, !currentStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportUsersExcelApi();
      toast.success("Xuất file Excel thành công");
    } catch (error) {
      console.error("Lỗi khi xuất file Excel:", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await updateUserApi(selectedUser._id, editForm);
      toast.success("Cập nhật thông tin thành công");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUserApi(selectedUser._id);
      toast.success("Xóa người dùng thành công");
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast.error("Không thể xóa người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  if (loading) return <div className="loading-indicator">Đang tải...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="product-table-container">
      <div className="table-header-section">
        <h3>Quản lý người dùng</h3>
        <div className="table-filters">
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <input
              type="text"
              placeholder="Tên / Email / Vai trò"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportExcel}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#45a049";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#4CAF50";
            }}
          >
            Xuất Excel
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>TÊN</th>
              <th>EMAIL</th>
              <th>VAI TRÒ</th>
              <th>TRẠNG THÁI</th>
              <th>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>#{user._id.substring(0, 6)}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isActive ? "active" : "inactive"
                      }`}
                    >
                      {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-btn"
                        onClick={() => navigate(`/users/${user._id}`)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(user)}
                        title="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteClick(user)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                      <button
                        className={`toggle-btn ${
                          !user.isActive ? "inactive" : ""
                        }`}
                        onClick={() =>
                          handleStatusToggle(user._id, user.isActive)
                        }
                        title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                      >
                        {user.isActive ? <FaBan /> : <FaCheck />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="showing-info">
          Hiển thị {users.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}-
          {Math.min(page * rowsPerPage, users.length)} trên {users.length} kết
          quả
        </div>
        <div className="pagination">
          <Pagination
            count={Math.ceil(users.length / rowsPerPage)}
            page={page}
            onChange={(e, newPage) => setPage(newPage)}
            color="primary"
          />
        </div>
      </div>

      {/* Dialog sửa user */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Sửa thông tin người dùng</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={editForm.email}
            onChange={(e) =>
              setEditForm({ ...editForm, email: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            value={editForm.phone}
            onChange={(e) =>
              setEditForm({ ...editForm, phone: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Vai trò"
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="user">Người dùng</MenuItem>
            <MenuItem value="admin">Quản trị viên</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xóa user */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa người dùng {selectedUser?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
