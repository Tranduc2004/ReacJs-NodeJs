import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts } from "../../services/api";
import ProductItem from "../../Components/ProductItem";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get("q");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await searchProducts({ search: query });
        setProducts(response);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchProducts();
    }
  }, [query]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Kết quả tìm kiếm cho "{query}"
      </Typography>
      {products.length === 0 ? (
        <Typography>Không tìm thấy sản phẩm nào phù hợp</Typography>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductItem product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Search;
