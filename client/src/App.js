import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Pages/Home";
import Listing from "./Pages/Listing";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import Profile from "./Pages/Profile";
import ChangePassword from "./Pages/ChangePassword";
import { Toaster } from "react-hot-toast";
import Search from "./Pages/Search";
import { AuthProvider } from "./context/AuthContext";
import Wishlist from "./Pages/Wishlist";
import ProductByCategory from "./Components/ProductByCategory";
import Checkout from "./Pages/Checkout";

const MyContext = createContext();

function App() {
  const [countryList, setCountryList] = useState([]);
  const [isHeaderFooterShow, setIsHeaderFooterShow] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      // Lấy user từ localStorage
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
      } else {
        setUser(null);
        setIsLogin(false);
        // Xóa dữ liệu không hợp lệ khỏi localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu từ localStorage:", error);
      // Nếu có lỗi, xóa dữ liệu không hợp lệ
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsLogin(false);
    }

    // Gọi API lấy danh sách quốc gia
    getCountry("https://countriesnow.space/api/v0.1/countries");
  }, []);

  const getCountry = async (url) => {
    try {
      const res = await axios.get(url);
      // Lấy danh sách quốc gia từ API và lưu vào state
      setCountryList(res.data.data.map((item) => item.country));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quốc gia:", error);
    }
  };

  const values = {
    countryList,
    isHeaderFooterShow,
    setIsHeaderFooterShow,
    isLogin,
    setIsLogin,
    user,
    setUser,
  };

  return (
    <MyContext.Provider value={values}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          {isHeaderFooterShow && <Header />}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listing" exact={true} element={<Listing />} />
            <Route
              path="/category/:categoryId"
              element={<ProductByCategory />}
            />
            <Route
              exact={true}
              path="/product/:id"
              element={<ProductDetails />}
            />
            <Route exact={true} path="/cart" element={<Cart />} />
            <Route exact={true} path="/signIn" element={<SignIn />} />
            <Route exact={true} path="/signUp" element={<SignUp />} />
            <Route exact={true} path="/profile" element={<Profile />} />
            <Route
              exact={true}
              path="/change-password"
              element={<ChangePassword />}
            />
            <Route exact={true} path="/search" element={<Search />} />
            <Route exact={true} path="/wishlist" element={<Wishlist />} />
            <Route exact={true} path="/checkout" element={<Checkout />} />
          </Routes>
          {isHeaderFooterShow && <Footer />}
        </BrowserRouter>
      </AuthProvider>
    </MyContext.Provider>
  );
}

export default App;
export { MyContext };
