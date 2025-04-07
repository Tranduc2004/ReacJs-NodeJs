import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import { getCategories, getBrands } from "../../services/api";

// Hàm định dạng số thành tiền Việt Nam
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Sidebar = ({ onFilterChange = () => {} }) => {
  const [priceRange, setPriceRange] = useState([0, 1000000000]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getCategories(),
          getBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setSidebarVisible(window.innerWidth > 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const updateFilters = () => {
    if (typeof onFilterChange === "function") {
      onFilterChange({
        priceRange,
        categories: selectedCategories,
        brands: selectedBrands,
      });
    }
  };

  useEffect(() => {
    updateFilters();
  }, [priceRange, selectedCategories, selectedBrands]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }
      return [...prev, categoryId];
    });
  };

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        return prev.filter((id) => id !== brandId);
      }
      return [...prev, brandId];
    });
  };

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      {isMobile && (
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <FaFilter style={{ marginRight: "8px" }} />
          {sidebarVisible ? "Hide Filters" : "Show Filters"}
        </button>
      )}
      <div
        className={`sidebar ${
          isMobile && !sidebarVisible ? "sidebar-hidden" : "sidebar-visible"
        }`}
      >
        <div className="filterBox">
          <h6>PRODUCT CATEGORIES</h6>
          <div className="scroll">
            <ul>
              {categories.map((category) => (
                <li key={category._id}>
                  <FormControlLabel
                    className="w-100"
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => handleCategoryChange(category._id)}
                      />
                    }
                    label={category.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="filterBox">
          <h6>FILTER BY PRICE</h6>
          <RangeSlider
            value={priceRange}
            onInput={handlePriceChange}
            min={0}
            max={100000000}
            step={10000}
          />
          <div className="d-flex pt-2 pb-2 priceRange">
            <span>
              Từ:{" "}
              <strong className="text-dark">
                {formatCurrency(priceRange[0])}
              </strong>
            </span>
            <span className="ml-auto">
              Đến:{" "}
              <strong className="text-dark">
                {formatCurrency(priceRange[1])}
              </strong>
            </span>
          </div>
        </div>

        <div className="filterBox">
          <h6>BRANDS</h6>
          <div className="scroll">
            <ul>
              {brands.map((brand) => (
                <li key={brand._id}>
                  <FormControlLabel
                    className="w-100"
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand._id)}
                        onChange={() => handleBrandChange(brand._id)}
                      />
                    }
                    label={brand.name}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <br />
        {!isMobile && (
          <Link>
            <img
              alt=""
              src="https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif"
              className="w-100"
            />
          </Link>
        )}
      </div>
    </>
  );
};

export default Sidebar;
