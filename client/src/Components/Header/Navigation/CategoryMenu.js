import React, { useState, useEffect, useRef } from "react";
import {
  FaAppleAlt,
  FaDrumstickBite,
  FaEgg,
  FaCoffee,
  FaBreadSlice,
  FaSnowflake,
  FaCookieBite,
  FaLeaf,
  FaAngleRight,
} from "react-icons/fa";

const categories = [
  { name: "Fruits & Vegetables", icon: <FaAppleAlt />, subMenu: null },
  { name: "Meats & Seafood", icon: <FaDrumstickBite />, subMenu: null },
  { name: "Breakfast & Dairy", icon: <FaEgg />, subMenu: null },
  {
    name: "Beverages",
    icon: <FaCoffee />,
    subMenu: [
      { name: "Tea", link: "/beverages/tea" },
      { name: "Coffee", link: "/beverages/coffee" },
      { name: "Soft Drinks", link: "/beverages/soft-drinks" },
    ],
  },
  {
    name: "Breads & Bakery",
    icon: <FaBreadSlice />,
    subMenu: [
      { name: "Bread", link: "/bakery/bread" },
      { name: "Cakes", link: "/bakery/cakes" },
    ],
  },
  { name: "Frozen Foods", icon: <FaSnowflake />, subMenu: null },
  { name: "Biscuits & Snacks", icon: <FaCookieBite />, subMenu: null },
  { name: "Grocery & Staples", icon: <FaLeaf />, subMenu: null },
];

const CategoryMenu = ({ closeMenu }) => {
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside, but not when clicking the toggle button itself
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem người dùng có click vào nút toggle không
      // Nếu element có class chứa "ALL CATEGORIES" thì đừng đóng menu
      const isToggleButton = event.target.closest(".bg-blue-400");

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !isToggleButton
      ) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 w-72 bg-white shadow-lg rounded-md z-50 border mt-3 animate-fadeIn"
    >
      <ul className="py-2">
        {categories.map((category, index) => (
          <li
            key={index}
            className="px-4 py-3 flex items-center justify-between hover:bg-gray-100 cursor-pointer relative"
            onMouseEnter={() => setOpenSubMenu(index)}
            onMouseLeave={() => setOpenSubMenu(null)}
          >
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 text-lg">{category.icon}</span>
              <span className="text-gray-700 font-medium">{category.name}</span>
            </div>

            {category.subMenu && <FaAngleRight className="text-gray-400" />}

            {/* Submenu cấp 2 */}
            {category.subMenu && openSubMenu === index && (
              <div className="absolute left-full top-0 bg-white shadow-lg rounded-md w-48 border py-2 animate-slideIn">
                {category.subMenu.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href={subItem.link}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-100"
                  >
                    {subItem.name}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryMenu;
