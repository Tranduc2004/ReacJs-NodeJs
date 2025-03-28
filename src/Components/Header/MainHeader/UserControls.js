import React from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { IoBagOutline } from "react-icons/io5";
import { CircleButton, CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";

const UserControls = () => {
  return (
    <>
      <div style={{ padding: "8px" }}>
        <CircleButton>
          <PersonOutlineIcon style={{ width: "24px", height: "24px" }} />
        </CircleButton>
      </div>
      <div className="flex items-center">
        <span className="text-gray-700">$3.29</span>
      </div>
      <div style={{ padding: "8px" }}>
        <CircleCartButton>
          <IoBagOutline
            style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
          />
          <CartBadge count={1} />
        </CircleCartButton>
      </div>
    </>
  );
};

export default UserControls;
