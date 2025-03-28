import React, { useState } from "react";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import Navigation from "./Navigation";
import MobileMenu from "./Mobile/MobileMenu";
import MobileSearch from "./Mobile/MobileSearch";

const Header = () => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const toggleCategoryMenu = () => {
    setShowCategoryMenu(!showCategoryMenu);
  };

  const toggleLocationMenu = () => {
    setShowLocationMenu(!showLocationMenu);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    if (showMobileSearch) setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (showMobileMenu) setShowMobileMenu(false);
  };

  return (
    <header className="w-full">
      <TopBar />

      <MainHeader
        showLocationMenu={showLocationMenu}
        toggleLocationMenu={toggleLocationMenu}
        toggleMobileMenu={toggleMobileMenu}
        toggleMobileSearch={toggleMobileSearch}
        showMobileMenu={showMobileMenu}
      />

      <Navigation
        showCategoryMenu={showCategoryMenu}
        toggleCategoryMenu={toggleCategoryMenu}
      />

      {showMobileMenu && <MobileMenu toggleMobileMenu={toggleMobileMenu} />}

      {showMobileSearch && <MobileSearch />}
    </header>
  );
};

export default Header;
