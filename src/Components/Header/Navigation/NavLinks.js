import React, { useState, useRef, useEffect } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";

const NavLinks = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const timeoutRef = useRef(null);

  // Hàm này sẽ được gọi khi chuột rời khỏi menu
  const handleMenuLeave = () => {
    // Đặt thời gian trễ trước khi đóng menu
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 300); // 300ms trễ trước khi đóng menu
  };

  // Hàm này sẽ được gọi khi chuột vào lại menu
  const handleMenuEnter = (index) => {
    // Xóa timeout nếu đang tồn tại
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(index);
  };

  // Dọn dẹp timeout khi component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const menuItems = [
    {
      name: "HOME",
      link: "/",
      subItems: [
        { name: "Homepage 1", link: "/home-1" },
        { name: "Homepage 2", link: "/home-2" },
        { name: "Homepage 3", link: "/home-3" },
      ],
    },
    {
      name: "SHOP",
      subItems: [
        {
          name: "Product Categories",
          link: "/categories",
          subItems: [
            { name: "Organic Food", link: "/organic" },
            { name: "Fresh Produce", link: "/fresh-produce" },
            { name: "Imported Goods", link: "/imported" },
          ],
        },
        {
          name: "Shopping Layouts",
          link: "/layouts",
          subItems: [
            { name: "Grid View", link: "/grid" },
            { name: "List View", link: "/list" },
            { name: "Gallery View", link: "/gallery" },
          ],
        },
        { name: "Special Offers", link: "/offers" },
      ],
    },
    { name: "MEATS & SEAFOOD", link: "/meats-seafood" },
    { name: "BAKERY", link: "/bakery" },
    { name: "BEVERAGES", link: "/beverages" },
    { name: "BLOG", link: "/blog" },
    { name: "CONTACT", link: "/contact" },
  ];

  return (
    <div className="hidden md:flex space-x-1 items-center">
      {menuItems.map((item, index) => (
        <div
          key={index}
          className="relative group"
          onMouseEnter={() => handleMenuEnter(index)}
          onMouseLeave={handleMenuLeave}
        >
          <a
            href={item.link}
            className="text-gray-700 flex items-center font-medium transition-all duration-300 hover:text-blue-600 px-3 py-2 rounded-md hover:bg-[rgba(59,130,246,0.1)] hover:scale-105 hover:no-underline"
          >
            {item.name}
            {item.subItems && (
              <span
                className={`ml-1 transition-transform duration-300 ${
                  activeMenu === index ? "rotate-180" : ""
                }`}
              >
                <FaAngleDown className="text-blue-500 w-[16px] h-[16px]" />
              </span>
            )}
          </a>

          {/* Level 1 submenu */}
          {item.subItems && activeMenu === index && (
            <div
              className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fadeIn"
              // Thêm padding và margin âm để tạo vùng hover lớn hơn
              style={{
                padding: "8px",
                margin: "-8px",
                paddingTop: "16px",
                marginTop: "-8px",
              }}
            >
              {/* Tạo hành lang hover */}
              <div className="absolute w-full h-8 -top-8 left-0" />

              {item.subItems.map((subItem, subIndex) => (
                <div
                  key={subIndex}
                  className="relative"
                  onMouseEnter={() => setActiveSubMenu(subIndex)}
                >
                  <a
                    href={subItem.link}
                    className="flex items-center justify-between px-4 py-2 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap hover:no-underline"
                  >
                    {subItem.name}
                    {subItem.subItems && (
                      <FaAngleRight className="text-gray-400 hover:text-blue-500 w-[12px] h-[12px]" />
                    )}
                  </a>

                  {/* Level 2 submenu */}
                  {subItem.subItems && activeSubMenu === subIndex && (
                    <div
                      className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 block animate-fadeIn"
                      // Thêm padding và margin âm để tạo vùng hover lớn hơn
                      style={{
                        padding: "8px",
                        margin: "-8px",
                        paddingLeft: "16px",
                        marginLeft: "-8px",
                      }}
                    >
                      {/* Tạo hành lang hover */}
                      <div className="absolute w-8 h-full -left-8 top-0" />

                      {subItem.subItems.map((nestedItem, nestedIndex) => (
                        <a
                          key={nestedIndex}
                          href={nestedItem.link}
                          className="block px-4 py-2 text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 whitespace-nowrap hover:no-underline"
                        >
                          {nestedItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavLinks;

// Add these styles to your CSS or tailwind.config.js:
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(10px); }
//   to { opacity: 1; transform: translateY(0); }
// }
//
// .animate-fadeIn {
//   animation: fadeIn 0.2s ease-out forwards;
// }
