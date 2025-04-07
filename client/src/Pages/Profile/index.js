import { useEffect, useContext, useState } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import { getUserProfile, updateUserProfile } from "../../services/api";

const Profile = () => {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  });

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        context.setIsLogin(false);
        navigate("/signin");
        return;
      }

      const response = await getUserProfile();
      setFormData({
        name: response.name,
        email: response.email,
        phone: response.phone,
      });

      context.setUser(response);
    } catch (err) {
      console.error("Lỗi khi tải thông tin:", err);
      if (
        err.response?.status === 401 ||
        err.message === "Không tìm thấy token"
      ) {
        localStorage.removeItem("token");
        context.setIsLogin(false);
        navigate("/signin");
      } else {
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    // Kiểm tra tên
    if (!formData.name) {
      errors.name = "Tên không được để trống";
    }

    // Kiểm tra số điện thoại
    if (!formData.phone) {
      errors.phone = "Số điện thoại không được để trống";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Xóa lỗi validation khi người dùng bắt đầu nhập lại
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra validation trước khi gửi form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        context.setIsLogin(false);
        navigate("/signin");
        return;
      }

      const response = await updateUserProfile(formData);
      // Cập nhật thông tin user trong context và localStorage
      context.setUser(response);
      localStorage.setItem("user", JSON.stringify(response));
      setShowSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      if (
        err.response?.status === 401 ||
        err.message === "Không tìm thấy token"
      ) {
        localStorage.removeItem("token");
        context.setIsLogin(false);
        navigate("/signin");
      } else {
        setError(
          err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        py: 4,
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 200px)",
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              fontWeight="bold"
            >
              Thông tin cá nhân
            </Typography>
            {!isEditing && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsEditing(true)}
              >
                Chỉnh sửa
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="name"
                  label="Tên"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                  disabled={!isEditing}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  disabled
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  id="phone"
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  variant="outlined"
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                  disabled={!isEditing}
                />
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        setValidationErrors({});
                        fetchUserProfile();
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/change-password")}
                    >
                      Đổi mật khẩu
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? "Đang xử lý..." : "Cập nhật"}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => {
          setShowSuccess(false);
          setIsEditing(false);
        }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Cập nhật thông tin thành công!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
