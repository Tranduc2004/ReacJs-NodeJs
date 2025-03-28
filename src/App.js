import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Pages/Home";
import Header from "./Components/Header";
import Footer from "./Components/Footer";

const MyContext = createContext();

function App() {
  const [countryList, setCountryList] = useState([]);

  useEffect(() => {
    getCountry("https://countriesnow.space/api/v0.1/countries");
  }, []);

  const getCountry = async (url) => {
    try {
      const res = await axios.get(url);
      // Lấy danh sách quốc gia từ API và lưu vào state
      setCountryList(res.data.data.map((item) => item.country));
      console.log(
        "Danh sách quốc gia:",
        res.data.data.map((item) => item.country)
      );
    } catch (error) {
      console.error("Lỗi khi lấy danh sách quốc gia:", error);
    }
  };

  const values = { countryList };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
        <Footer />
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };
