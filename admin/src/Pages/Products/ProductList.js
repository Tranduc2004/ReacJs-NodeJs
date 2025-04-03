import React from "react";
import { Link } from "react-router-dom";
import ProductTable from "../../Components/ProductTable";
import { IoBag } from "react-icons/io5";
import { BiCategory } from "react-icons/bi";
import { MdBrandingWatermark } from "react-icons/md";
import "./styles.css";

const ProductList = () => {
  return (
    <div className="product-list-container">
      {/* Header */}
      <div className="header">
        <h1>Product List</h1>
        <div className="breadcrumbs">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="separator">~</span>
          <Link to="/products" className="breadcrumb-link">
            Products
          </Link>
          <span className="separator">~</span>
          <span>Product List</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        {/* Total Products Card */}
        <div className="stats-card products-card">
          <div className="card-content">
            <h2 className="card-value">547</h2>
            <p className="card-label">Total Products</p>
          </div>
          <div className="card-icon">
            <IoBag />
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="stats-card categories-card">
          <div className="card-content">
            <h2 className="card-value">605</h2>
            <p className="card-label">Total_categories</p>
          </div>
          <div className="card-icon">
            <BiCategory />
          </div>
        </div>

        {/* Total Brands Card */}
        <div className="stats-card brands-card">
          <div className="card-content">
            <h2 className="card-value">249</h2>
            <p className="card-label">Total_barnds</p>
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
