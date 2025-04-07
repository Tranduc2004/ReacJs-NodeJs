import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductTable from "../../Components/ProductTable";
import { IoBag } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { MdBrandingWatermark } from "react-icons/md";
import { fetchDataFromApi } from "../../utils/api";
import "./styles.css";

const ProductList = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Lấy danh sách sản phẩm
        const productsData = await fetchDataFromApi("/api/products");
        const products = Array.isArray(productsData[0])
          ? productsData[0]
          : productsData;

        // Lấy danh sách danh mục
        const categoriesData = await fetchDataFromApi("/api/categories");
        const categories = Array.isArray(categoriesData) ? categoriesData : [];

        // Lấy danh sách thương hiệu từ API
        const brandsData = await fetchDataFromApi("/api/brands");
        const brands = Array.isArray(brandsData) ? brandsData : [];

        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          totalBrands: brands.length,
        });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="product-list-container">
      {/* Header */}
      <div className="header">
        <h1>Danh sách sản phẩm</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/products" className="breadcrumb-link">
            Sản phẩm
          </Link>
          <span className="separator">~</span>
          <span>Danh sách sản phẩm</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        {/* Total Products Card */}
        <div className="stats-card products-card">
          <div className="card-content">
            <h2 className="card-value">
              {loading ? "..." : stats.totalProducts}
            </h2>
            <p className="card-label">Tổng sản phẩm</p>
          </div>
          <div className="card-icon">
            <IoBag />
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="stats-card categories-card">
          <div className="card-content">
            <h2 className="card-value">
              {loading ? "..." : stats.totalCategories}
            </h2>
            <p className="card-label">Tổng danh mục</p>
          </div>
          <div className="card-icon">
            <BiCategory />
          </div>
        </div>

        {/* Total Brands Card */}
        <div className="stats-card brands-card">
          <div className="card-content">
            <h2 className="card-value">
              {loading ? "..." : stats.totalBrands}
            </h2>
            <p className="card-label">Tổng thương hiệu</p>
          </div>
          <div className="card-icon">
            <MdBrandingWatermark />
          </div>
        </div>
      </div>

      {/* Product Table Component */}
      <ProductTable />
    </div>
  );
};

export default ProductList;
