import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TbLayoutDashboard, TbFileDescription } from "react-icons/tb";
import { MdOutlineSecurity } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { BiPackage, BiMessageDetail } from "react-icons/bi";
import { RiBillLine } from "react-icons/ri";
import { BsCart3, BsChevronDown } from "react-icons/bs";
import {
  IoNotificationsOutline,
  IoSettingsOutline,
  IoWarningOutline,
  IoColorPaletteOutline,
  IoStatsChartOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { LuLayoutTemplate } from "react-icons/lu";
import { FaRegUserCircle } from "react-icons/fa";
import { PiTextTBold } from "react-icons/pi";
import { VscError } from "react-icons/vsc";
import { MdChangeCircle } from "react-icons/md";
import { useSidebar } from "../../context/SidebarContext";
import { IoBag } from "react-icons/io5";

const MenuItem = ({ icon: Icon, text, badge, children, isDropdown }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (isDropdown) {
    return (
      <div className="menu-dropdown">
        <div className="menu-item">
          <div
            className="d-flex align-items-center justify-content-between py-2 px-3"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="d-flex align-items-center">
              <Icon className="menu-icon" />
              <span className="ml-3">{text}</span>
            </div>
            <BsChevronDown
              className={`menu-dropdown-icon ${isOpen ? "open" : ""}`}
            />
          </div>
        </div>
        {isOpen && <div className="submenu">{children}</div>}
      </div>
    );
  }

  return (
    <Link to={`/${text.toLowerCase()}`} className="menu-item">
      <div className="d-flex align-items-center justify-content-between py-2 px-3">
        <div className="d-flex align-items-center">
          <Icon className="menu-icon" />
          <span className="ml-3">{text}</span>
        </div>
        {badge && (
          <span className={`badge badge-${badge.type}`}>{badge.text}</span>
        )}
      </div>
    </Link>
  );
};

const SubMenuItem = ({ text }) => (
  <Link
    to={`/products/${text.toLowerCase().replace(/\s+/g, "-")}`}
    className="submenu-item"
  >
    <span>{text}</span>
  </Link>
);

const MenuSection = ({ title, children }) => (
  <div className="menu-section mb-4">
    <h6 className="menu-title px-3 mb-3">{title}</h6>
    <div className="menu-items">{children}</div>
  </div>
);

const Sidebar = () => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className={`sidebar ${isSidebarOpen ? "" : "collapsed"}`}>
      <MenuSection title="MAIN PAGES">
        <MenuItem icon={TbLayoutDashboard} text="Dashboard" />
        <MenuItem icon={IoBag} text="Products" isDropdown>
          <SubMenuItem text="Product List" />
          <SubMenuItem text="Product View" />
          <SubMenuItem text="Product Upload" />
        </MenuItem>
        <MenuItem
          icon={FaRegUser}
          text="Users"
          badge={{ type: "hot", text: "HOT" }}
        />
        <MenuItem
          icon={BiPackage}
          text="Products"
          badge={{ type: "new", text: "NEW" }}
        />
        <MenuItem icon={RiBillLine} text="Invoices" />
        <MenuItem
          icon={BsCart3}
          text="Orders"
          badge={{ type: "count", text: "5" }}
        />
        <MenuItem
          icon={BiMessageDetail}
          text="Messages"
          badge={{ type: "count", text: "3" }}
        />
        <MenuItem
          icon={IoNotificationsOutline}
          text="Notifications"
          badge={{ type: "count", text: "9" }}
        />
        <MenuItem icon={IoSettingsOutline} text="Settings" />
        <MenuItem icon={LuLayoutTemplate} text="Blank Page" />
      </MenuSection>

      <MenuSection title="UI PAGES">
        <MenuItem icon={IoWarningOutline} text="Alerts" />
        <MenuItem icon={FaRegUserCircle} text="Avatars" />
        <MenuItem icon={PiTextTBold} text="Headings" />
        <MenuItem icon={IoSettingsOutline} text="Buttons" />
        <MenuItem icon={IoColorPaletteOutline} text="Colors" />
        <MenuItem icon={IoStatsChartOutline} text="Charts" />
      </MenuSection>

      <MenuSection title="OTHER PAGES">
        <MenuItem icon={TbFileDescription} text="Overview" />
        <MenuItem icon={VscError} text="Site Error" />
        <MenuItem icon={IoDocumentTextOutline} text="Documentation" />
        <MenuItem
          icon={MdChangeCircle}
          text="Change Log"
          badge={{ type: "version", text: "v2.0" }}
        />
      </MenuSection>

      <div className="sidebar-wrapper">
        <div className="sidebar-footer">
          <button className="logout-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lock-icon"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
