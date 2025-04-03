import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard";
import Header from "./Components/Header";
import Sidebar from "./Components/SideBar";
import { SidebarProvider } from "./context/SidebarContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ProductList from "./Pages/Products/ProductList";
import ProductView from "./Pages/Products/ProductView";
import ProductUpload from "./Pages/Products/ProductUpload";

// Layout component bọc các components cần Header và Sidebar
const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main">
        <Sidebar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <Layout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<ProductList />} />
                    <Route
                      path="products/product-list"
                      element={<ProductList />}
                    />
                    <Route
                      path="products/product-view"
                      element={<ProductView />}
                    />
                    <Route
                      path="products/product-upload"
                      element={<ProductUpload />}
                    />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
