import React, { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import { BsShieldFillExclamation } from "react-icons/bs";
import { FaRegUser } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openMyAcc = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMyAccDrop = () => {
    setAnchorEl(null);
  };

  return (
    <div className="myAccWrapper">
      <Button className="myAcc d-flex align-items-center" onClick={handleClick}>
        <div className="userImg">
          <span className="rounded-circle">
            <img
              src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp"
              alt="avatar"
            />
          </span>
        </div>

        <div className="userInfo">
          <h4>Trần Đức</h4>
          <p className="mb-0">@tranduc.204</p>
        </div>
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={openMyAcc}
        onClose={handleCloseMyAccDrop}
        onClick={handleCloseMyAccDrop}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleCloseMyAccDrop}>
          <ListItemIcon>
            <Avatar fontSize="small" />
          </ListItemIcon>
          My Account
        </MenuItem>

        <MenuItem onClick={handleCloseMyAccDrop}>
          <ListItemIcon>
            <BsShieldFillExclamation />
          </ListItemIcon>
          Reset Password
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCloseMyAccDrop}>
          <ListItemIcon>
            <IoLogOutOutline />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default UserMenu;
