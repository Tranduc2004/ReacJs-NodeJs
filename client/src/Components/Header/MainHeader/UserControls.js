import React, { useState, useContext } from "react";
import Button from "@mui/material/Button";
import { IoBagOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { CircleButton, CircleCartButton } from "../common/CircleButtons";
import CartBadge from "../common/CartBadge";
import { FaUserLarge } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
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
import { IoIosLogOut } from "react-icons/io";

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
        <div
          className="Control-user"
          style={{ display: "flex", alignItems: "center", gap: "16px" }}
        >
          {context.isLogin !== true ? (
            <Button
              component={Link}
              to="/signin"
              className="btn-blue btn-lg btn-big btn-round mr-3"
              sx={{
                backgroundColor: "#00aaff",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0088cc",
                },
              }}
            >
              Đăng nhập
            </Button>
          ) : (
            <>
              <CircleButton
                onClick={handleClick}
                className="blue-circle-button"
              >
                <CiUser style={{ width: "24px", height: "24px" }} />
              </CircleButton>
              <Menu
                className="blue-user-menu"
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
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 170, 255, 0.15)",
                    border: "1px solid rgba(0, 170, 255, 0.2)",
                  },
                }}
              >
                <MenuItem
                  sx={{ pointerEvents: "none" }}
                  className="blue-menu-greeting"
                >
                  <Typography variant="body1">
                    Xin chào, {context.user?.name || "Khách"}
                  </Typography>
                </MenuItem>
                <Divider className="blue-menu-divider" />
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <FaUserLarge />
                  Tài khoản của tôi
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/wishlist"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <FaHeart />
                  Danh sách yêu thích
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/cart"
                  onClick={handleClose}
                  className="blue-menu-item"
                >
                  <ShoppingCartIcon fontSize="small" />
                  Giỏ hàng của tôi
                </MenuItem>
                <MenuItem
                  onClick={handleLogout}
                  className="blue-menu-item blue-logout-item"
                >
                  <IoIosLogOut fontSize="small" />
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          )}

          {context.isLogin && (
            <Link to="/cart" style={{ textDecoration: "none" }}>
              <CircleCartButton className="blue-circle-button">
                <IoBagOutline
                  style={{ width: "24px", height: "24px", color: "#ea2b0f" }}
                />
                <CartBadge />
              </CircleCartButton>
            </Link>
          )}
        </div>
      ) : (
        <Button
          component={Link}
          to="/signin"
          size="small"
          variant="contained"
          sx={{
            backgroundColor: "#00aaff",
            "&:hover": {
              backgroundColor: "#0088cc",
            },
          }}
        >
          {context.isLogin ? <CiUser /> : "Đăng nhập"}
        </Button>
      )}
    </>
  );
};

export default UserControls;
