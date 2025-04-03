import React from "react";
import { CiSearch } from "react-icons/ci";

const MobileSearch = () => {
  return (
    <div className="fixed inset-0 bg-white z-50 px-4 pt-16 md:hidden">
      <div className="relative mt-4">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          className="w-full h-14 rounded-lg bg-gray-100 py-4 px-4 pr-10 text-lg"
          autoFocus
        />
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <CiSearch className="text-2xl" />
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-medium text-lg mb-2">Tìm kiếm phổ biến</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm">
            Organic fruits
          </span>
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm">
            Fresh vegetables
          </span>
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm">
            Dairy products
          </span>
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm">
            Meat & Seafood
          </span>
          <span className="px-3 py-2 bg-gray-100 rounded-full text-sm">
            Beverages
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileSearch;
