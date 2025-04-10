import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import ProductCard from "../../Components/ProductItem";
import { getWishlist, isAuthenticated } from "../../services/api";
import { toast } from "react-toastify";

const Wishlist = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        console.log("Is authenticated:", isAuthenticated());
        console.log("Token:", localStorage.getItem("token"));

        setLoading(true);
        const response = await getWishlist();
        console.log("Wishlist response:", response);

        if (response && response.success && Array.isArray(response.products)) {
          setProducts(response.products);
        } else {
          setProducts([]);
          toast.warning("Không có sản phẩm yêu thích nào");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu thích:", error);
        toast.error("Không thể tải danh sách yêu thích");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Sản phẩm yêu thích
      </Typography>

      {products.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Bạn chưa có sản phẩm yêu thích nào
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;
