import { useEffect, useContext } from "react";
import { MyContext } from "../../App";
import { Link } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Divider,
  ThemeProvider,
  createTheme,
} from "@mui/material";

// Tạo một theme tùy chỉnh với #00aaff làm màu chính
const theme = createTheme({
  palette: {
    primary: {
      main: "#00aaff",
    },
  },
});

// Biểu tượng Google dưới dạng một component
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    style={{ width: "20px", height: "20px", marginRight: "8px" }}
  >
    <path
      fill="#fbc02d"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
    <path
      fill="#e53935"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    ></path>
    <path
      fill="#4caf50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    ></path>
    <path
      fill="#1565c0"
      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    ></path>
  </svg>
);

const SignUp = () => {
  const context = useContext(MyContext);

  useEffect(() => {
    context.setIsHeaderFooterShow(false);
  }); // Chỉ chạy một lần khi component mount

  return (
    <ThemeProvider theme={theme}>
      <Box
        className="section signUpPage"
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #00aaff 0%, #0077cc 100%)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Hình dạng nền */}
        <Box
          sx={{
            position: "absolute",
            bottom: -100,
            left: -100,
            width: "50%",
            height: "80%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />

        <Container
          maxWidth="sm"
          sx={{ py: 8, position: "relative", zIndex: 1 }}
        >
          <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Box display="flex" alignItems="center">
                {/* Logo Icon */}
                <Box
                  sx={{
                    height: 48,
                    width: 48,
                    backgroundColor: "yellow",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                  }}
                >
                  <Typography variant="h5" color="blue">
                    😀
                  </Typography>
                </Box>

                {/* Logo Text */}
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    Bacola
                  </Typography>
                  <Typography
                    variant="body2"
                    color="gray"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Online Grocery Shopping Center
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Typography
              variant="h5"
              component="h2"
              align="center"
              fontWeight="medium"
              mb={4}
            >
              Đăng ký
            </Typography>

            <Box component="form" sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Tên"
                    name="name"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="phone"
                    label="Số điện thoại"
                    name="phone"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Mật khẩu"
                type="password"
                id="password"
                autoComplete="new-password"
                variant="outlined"
                sx={{ mb: 1 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ py: 1.5, color: "white" }}
                  >
                    Đăng ký
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ py: 1.5 }}
                    onClick={() => {
                      context.setIsHeaderFooterShow(true);
                      setTimeout(() => {
                        window.location.href = "/";
                      }, 80);
                    }}
                  >
                    Hủy bỏ
                  </Button>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2, mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Đã có tài khoản?
                <Button
                  component={Link}
                  to="/signin"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Đăng nhập
                </Button>
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Hoặc tiếp tục với tài khoản mạng xã hội
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                py: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GoogleIcon /> Đăng ký bằng Google
            </Button>
          </Paper>
        </Container>

        {/* Hình dạng bổ sung cho sự thú vị về mặt hình ảnh */}
        <Box
          sx={{
            position: "absolute",
            top: -50,
            right: -50,
            width: "30%",
            height: "40%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default SignUp;
