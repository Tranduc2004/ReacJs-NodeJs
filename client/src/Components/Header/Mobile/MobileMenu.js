import React from "react";
import { IoClose } from "react-icons/io5";
import { CircleButton } from "../common/CircleButtons";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { MobileLocationSelector } from "../common/LocationSelector";

const MobileMenu = ({ toggleMobileMenu }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 pt-16 overflow-y-auto md:hidden">
      <button
        onClick={toggleMobileMenu}
        className="absolute top-4 right-4 text-gray-600"
      >
        <IoClose className="text-2xl" />
      </button>

      <div className="px-4 py-4">
        {/* User Account Info */}
        <div className="flex items-center mb-6 pb-4 border-b">
          <div style={{ padding: "8px" }}>
            <CircleButton>
              <PersonOutlineIcon style={{ width: "24px", height: "24px" }} />
            </CircleButton>
          </div>
          <div className="ml-3">
            <p className="font-medium">My Account</p>
            <p className="text-sm text-blue-500">Sign in / Register</p>
          </div>
        </div>

        {/* Location Selector */}
        <div className="mb-6 pb-4 border-b w-full">
          <MobileLocationSelector className="w-full" />
        </div>

        {/* Main Navigation */}
        <ul className="space-y-1">
          <li>
            <a href="/">
              <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
                <span className="font-medium">HOME</span>
                <span>▼</span>
              </button>
            </a>
          </li>
          <li>
            <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
              <span className="font-medium">SHOP</span>
              <span>▼</span>
            </button>
          </li>
          <li>
            <button className="flex items-center justify-between w-full px-3 py-3 hover:bg-gray-50 rounded-lg">
              <span className="font-medium">CATEGORIES</span>
              <span>▼</span>
            </button>
          </li>
          <li>
            <a
              href="/meats-seafood"
              className="block px-3 py-3 hover:bg-gray-50 rounded-lg"
            >
              MEATS & SEAFOOD
            </a>
          </li>
          <li>
            <a
              href="/bakery"
              className="block px-3 py-3 hover:bg-gray-50 rounded-lg"
            >
              BAKERY
            </a>
          </li>
          <li>
            <a
              href="/beverages"
              className="block px-3 py-3 hover:bg-gray-50 rounded-lg"
            >
              BEVERAGES
            </a>
          </li>
          <li>
            <a
              href="/blog"
              className="block px-3 py-3 hover:bg-gray-50 rounded-lg"
            >
              BLOG
            </a>
          </li>
          <li>
            <a
              href="/contact"
              className="block px-3 py-3 hover:bg-gray-50 rounded-lg"
            >
              CONTACT
            </a>
          </li>
        </ul>

        {/* Cart Summary */}
        <div className="mt-8 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">Your Cart</p>
            <span className="text-sm font-medium bg-red-500 text-white px-2 py-1 rounded-full">
              1
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Total: <span className="text-gray-700 font-medium">$3.29</span>
          </p>
          <button className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-medium">
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
