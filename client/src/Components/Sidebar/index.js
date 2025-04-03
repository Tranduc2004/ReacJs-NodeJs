import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFilter } from "react-icons/fa";

const Sidebar = () => {
  const [value, setValue] = useState([0, 100]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check window size on load and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      // Auto-hide sidebar on mobile by default
      if (window.innerWidth <= 768) {
        setSidebarVisible(false);
      } else {
        setSidebarVisible(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Men"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Women"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Beauty"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Kids"
                />
              </li>
              {/* Additional items can be shortened for mobile */}
              {!isMobile && (
                <>
                  <li>
                    <FormControlLabel
                      className="w-100"
                      control={<Checkbox />}
                      label="Men"
                    />
                  </li>
                  <li>
                    <FormControlLabel
                      className="w-100"
                      control={<Checkbox />}
                      label="Women"
                    />
                  </li>
                  <li>
                    <FormControlLabel
                      className="w-100"
                      control={<Checkbox />}
                      label="Beauty"
                    />
                  </li>
                  <li>
                    <FormControlLabel
                      className="w-100"
                      control={<Checkbox />}
                      label="Kids"
                    />
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="filterBox">
          <h6>FILTER BY PRICE</h6>
          <RangeSlider
            value={value}
            onInput={setValue}
            min={100}
            max={60000}
            step={5}
          />

          <div className="d-flex pt-2 pb-2 priceRange">
            <span>
              From: <strong className="text-dark">Rs: {value[0]}</strong>
            </span>
            <span className="ml-auto">
              To: <strong className="text-dark">Rs: {value[1]}</strong>
            </span>
          </div>
        </div>
        <div className="filterBox">
          <h6>BRANDS</h6>
          <div className="scroll">
            <ul>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Frito Lay"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Nespresso"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Oreo"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Quaker"
                />
              </li>
              <li>
                <FormControlLabel
                  className="w-100"
                  control={<Checkbox />}
                  label="Welch's"
                />
              </li>
            </ul>
          </div>
        </div>
        <br />
        {/* Hide banner ad on small mobile screens */}
        <div className={isMobile && window.innerWidth <= 576 ? "d-none" : ""}>
          <Link>
            <img
              alt=""
              src="https://klbtheme.com/bacola/wp-content/uploads/2021/05/sidebar-banner.gif"
              className="w-100"
            />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
