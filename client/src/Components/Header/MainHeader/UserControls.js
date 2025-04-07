import React, { useState, useContext } from "react";
import Button from "@mui/material/Button";
import { IoBagOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { CircleButton, CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";
import {
  useMediaQuery,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import { MyContext } from "../../../App";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../../../services/api";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const UserControls = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    context.setIsLogin(false);
    context.setUser(null);
    handleClose();
    navigate("/");
  };

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
            <>
              <CircleButton onClick={handleClick}>
                <CiUser style={{ width: "24px", height: "24px" }} />
              </CircleButton>
              <Menu
                className="custom-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem sx={{ pointerEvents: "none" }}>
                  <Typography variant="body1" sx={{ py: 1 }}>
                    Xin chào, {context.user?.name || "Khách"}
                  </Typography>
                </MenuItem>
                <Divider />
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                  className="menu-item"
                >
                  Tài khoản của tôi
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/cart"
                  onClick={handleClose}
                  className="menu-item"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <ShoppingCartIcon fontSize="small" />
                  Giỏ hàng của tôi
                </MenuItem>
                <MenuItem onClick={handleLogout} className="menu-item">
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}

          {context.isLogin && (
            <Link to="/cart" style={{ textDecoration: "none" }}>
              <CircleCartButton>
                <IoBagOutline
                  style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
                />
                <CartBadge />
              </CircleCartButton>
            </Link>
          )}
        </div>
      ) : (
        <Button component={Link} to="/signin" size="small" variant="contained">
          {context.isLogin ? <CiUser /> : "Đăng nhập"}
        </Button>
      )}
    </>
  );
};

export default UserControls;
