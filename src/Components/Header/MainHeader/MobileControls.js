import React from "react";
import { CiSearch } from "react-icons/ci";
import { IoClose } from "react-icons/io5";
import { IoBagOutline } from "react-icons/io5";
import { CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";

const MobileControls = ({
  toggleMobileSearch,
  toggleMobileMenu,
  showMobileMenu,
}) => {
  return (
    <>
      <button
        onClick={toggleMobileSearch}
        className="block text-gray-600 p-2"
        aria-label="Search"
      >
        <CiSearch className="text-2xl" />
      </button>

      <div style={{ padding: "8px" }}>
        <CircleCartButton>
          <IoBagOutline
            style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
          />
          <CartBadge count={1} />
        </CircleCartButton>
      </div>

      <button
        onClick={toggleMobileMenu}
        className="block text-gray-600 p-2"
        aria-label="Menu"
      >
        {showMobileMenu ? (
          <IoClose className="text-2xl" />
        ) : (
          <span className="text-2xl">☰</span>
        )}
      </button>
    </>
  );
};

export default MobileControls;
