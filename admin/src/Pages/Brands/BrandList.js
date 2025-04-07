import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchDataFromApi, deleteData } from "../../utils/api";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./styles.css";
import { useTheme } from "../../context/ThemeContext";

const BrandList = () => {
  const { isDarkMode } = useTheme();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
      try {
        await deleteData("/api/brands/", id);
        fetchBrands();
      } catch (err) {
        console.error("Lỗi khi xóa thương hiệu:", err);
        alert("Không thể xóa thương hiệu");
      }
    }
  };

  return (
    <div
      className={`brand-list-container ${
        isDarkMode ? "dark-mode" : "light-mode"
      }`}
      style={{
        backgroundColor: isDarkMode ? "#0f1824" : "#fff",
        minHeight: "100vh",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div
        className="header"
        style={{
          backgroundColor: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#fff",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
          boxShadow: isDarkMode
            ? "0 2px 10px rgba(0, 0, 0, 0.2)"
            : "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: isDarkMode ? "#fff" : "#000" }}>
          Danh sách thương hiệu
        </h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="separator">~</span>
          <Link to="/brands" className="breadcrumb-link">
            Thương hiệu
          </Link>
          <span className="separator">~</span>
          <span>Danh sách thương hiệu</span>
        </div>
      </div>

      {/* Add Brand Button */}
      <div className="action-bar">
        <Link to="/brands/brand-add" className="add-button">
          <FaPlus /> Thêm thương hiệu mới
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ color: isDarkMode ? "#fff" : "#000" }}>
            Đang tải dữ liệu...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchBrands}>Thử lại</button>
        </div>
      )}

      {/* Brands Table */}
      {!loading && !error && (
        <div className="table-container">
          <h2
            className="table-title mb-2"
            style={{ color: isDarkMode ? "#fff" : "#000" }}
          >
            Danh sách thương hiệu
          </h2>
          <table className="brand-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Website</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <tr key={brand._id}>
                    <td className="logo-cell">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="brand-logo"
                      />
                    </td>
                    <td>{brand.name}</td>
                    <td>
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        {brand.website}
                      </a>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          brand.isActive ? "active" : "inactive"
                        }`}
                      >
                        {brand.isActive ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          to={`/brands/brand-edit/${brand._id}`}
                          className="action-button edit"
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          className="action-button delete"
                          onClick={() => handleDelete(brand._id)}
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    Không có thương hiệu nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BrandList;
