import React from "react";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Button from "@mui/material/Button";
import { IoBagOutline } from "react-icons/io5";
import { CircleButton, CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";
import { useContext } from "react";
import { useMediaQuery } from "@mui/material";
import { MyContext } from "../../../App";
import { Link } from "react-router-dom";

const UserControls = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const context = useContext(MyContext);

  return (
    <>
      {!isMobile ? (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {context.isLogin !== true ? (
            <Button
              component={Link}
              to="/signin"
              className="btn-blue btn-lg btn-big btn-round mr-3"
            >
              Đăng nhập
            </Button>
          ) : (
            <CircleButton>
              <PersonOutlineIcon style={{ width: "24px", height: "24px" }} />
            </CircleButton>
          )}

          <span className="text-gray-700">$3.29</span>
          <CircleCartButton>
            <IoBagOutline
              style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
            />
            <CartBadge count={1} />
          </CircleCartButton>
        </div>
      ) : (
        <Button size="small" variant="contained">
          Đăng nhập
        </Button>
      )}
    </>
  );
};

export default UserControls;
