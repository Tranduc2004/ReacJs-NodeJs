import React from "react";
import { CiSearch } from "react-icons/ci";
import Button from "@mui/material/Button";

const SearchBar = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="w-full h-14 rounded-lg bg-gray-100 py-4 px-4 pr-14 text-lg"
      />
      <Button
        sx={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          borderRadius: "50%",
          minWidth: "50px",
          width: "50px",
          height: "50px",
          padding: 0,
        }}
      >
        <CiSearch size={28} />
      </Button>
    </div>
  );
};

export default SearchBar;
