import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.webp";
import { MdMenuOpen } from "react-icons/md";
import Button from "@mui/material/Button";

const Header = () => {
  return (
    <>
      <header className="d-flex align-items-center">
        <div className="container-fluid">
          <div className="row d-flex align-items-center">
            {/* Logo */}
            <div className="col-xs-3">
              <Link to="/" className="d-flex align-items-center logo">
                <img src={logo} alt="logo" />
                <span className="ml-2">HOTASH</span>
              </Link>
            </div>

            <div className="col-xs-3 d-flex align-items-center">
              <Button>
                <MdMenuOpen />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
