import React from "react";
import { FaEye, FaEdit, FaTrash, FaStar } from "react-icons/fa";
import "./styles.css";
import Pagination from "@mui/material/Pagination";

const ProductTable = () => {
  const products = [
    {
      id: "#1",
      image: "https://mironcoder-hotash.netlify.app/images/product/01.webp  ",
      name: "Tops and skirt set for Female",
      description: "Women's exclusive summer Top...",
      category: "womans",
      brand: "richman",
      price: {
        original: 21.0,
        sale: 19.0,
      },
      stock: 30,
      rating: { value: 4.9, count: 16 },
      orders: 380,
      sales: "38k",
    },
    {
      id: "#2",
      image: "https://mironcoder-hotash.netlify.app/images/product/02.webp",
      name: "Leather belt steve madden m...",
      description: "Steve madden men",
      category: "mans",
      brand: "lubana",
      price: {
        sale: 14.0,
      },
      stock: 23,
      rating: { value: 4.5, count: 38 },
      orders: 189,
      sales: "9k",
    },
    // Thêm các sản phẩm khác tương tự
  ];

  return (
    <div className="product-table-container">
      <div className="table-header-section">
        <h3>Best Selling Products</h3>
        <div className="table-filters">
          <div className="filter-group">
            <label>SHOW BY</label>
            <select defaultValue="12">
              <option value="12">12 Row</option>
              <option value="24">24 Row</option>
              <option value="36">36 Row</option>
            </select>
          </div>

          <div className="filter-group">
            <label>CATEGORY BY</label>
            <select defaultValue="mans">
              <option value="mans">Mans</option>
              <option value="womans">Womans</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div className="filter-group">
            <label>BRAND BY</label>
            <select defaultValue="ecstasy">
              <option value="ecstasy">Ecstasy</option>
              <option value="richman">Richman</option>
              <option value="lubana">Lubana</option>
            </select>
          </div>

          <div className="filter-group">
            <label>SEARCH BY</label>
            <input
              type="text"
              placeholder="id / name / category / brand"
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" />
              </th>
              <th>UID</th>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>PRICE</th>
              <th>STOCK</th>
              <th>RATING</th>
              <th>ORDER</th>
              <th>SALES</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{product.id}</td>
                <td>
                  <div className="product-info">
                    <img src={product.image} alt={product.name} />
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-description">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  {product.price.original && (
                    <span className="original-price">
                      ${product.price.original}
                    </span>
                  )}
                  <span className="sale-price">${product.price.sale}</span>
                </td>
                <td>{product.stock}</td>
                <td>
                  <div className="rating">
                    <FaStar className="star-icon" />
                    <span>{product.rating.value}</span>
                    <span className="rating-count">
                      ({product.rating.count})
                    </span>
                  </div>
                </td>
                <td>{product.orders}</td>
                <td>${product.sales}</td>
                <td>
                  <div className="action-buttons">
                    <button className="view-btn">
                      <FaEye />
                    </button>
                    <button className="edit-btn">
                      <FaEdit />
                    </button>
                    <button className="delete-btn">
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="showing-info">showing 12 of 60 results</div>
        <div className="pagination">
          <Pagination count={10} color="primary" />
        </div>
      </div>
    </div>
  );
};

export default ProductTable;
