import React, { useState, useEffect } from "react";
import CategoryMenu from "./CategoryMenu";
import NavLinks from "./NavLinks";
import { FaAngleDown } from "react-icons/fa";

const Navigation = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Current scroll position
      const currentScrollPos = window.pageYOffset;

      // Determine scroll direction and threshold
      const scrollingDown = prevScrollPos < currentScrollPos;

      // Chỉ thay đổi trạng thái khi cuộn quá 50px
      if (currentScrollPos > 50) {
        // Hide nav when scrolling down, show when scrolling up
        setIsVisible(!scrollingDown);

        // Auto close category menu when scrolling down
        if (scrollingDown && showCategoryMenu) {
          setShowCategoryMenu(false);
        }
      } else {
        // Luôn hiển thị khi ở đầu trang
        setIsVisible(true);
      }

      // Update previous scroll position
      setPrevScrollPos(currentScrollPos);
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollPos, showCategoryMenu]);

  // Function to toggle the menu on button click
  const toggleCategoryMenu = () => {
    setShowCategoryMenu(!showCategoryMenu);
  };

  // Calculate classes based on visibility state
  const navClasses = `w-full px-4 py-3 border-t border-b relative hidden md:block transition-all duration-300 bg-white 
    ${isVisible ? "  top-0 bg-white z-1000" : "-translate-y-full"}`;

  return (
    <nav className={`sticky ${navClasses}`}>
      <div className="max-w-6xl mx-auto flex items-center space-x-6">
        {/* Nút All Categories */}
        <div
          className="bg-blue-400 text-white rounded-full px-4 py-2 flex items-center cursor-pointer relative"
          onClick={toggleCategoryMenu}
        >
          <span className="mr-2">☰</span>
          <span className="font-medium">ALL CATEGORIES</span>
          <span className="ml-2">
            <FaAngleDown
              className={`text-white w-[18px] h-[18px] transition-transform duration-300 ${
                showCategoryMenu ? "rotate-180" : ""
              }`}
            />
          </span>

          {/* Hiển thị menu khi nhấn */}
          {showCategoryMenu && (
            <CategoryMenu closeMenu={() => setShowCategoryMenu(false)} />
          )}
        </div>

        {/* Menu chính */}
        <NavLinks />
      </div>
    </nav>
  );
};

export default Navigation;
