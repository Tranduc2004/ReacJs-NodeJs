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
import CategoryAdd from "./Pages/Category/CategoryAdd";
import CategoryList from "./Pages/Category/CategoryList";
import BrandList from "./Pages/Brands/BrandList";
import BrandAdd from "./Pages/Brands/BrandAdd";
import BrandEdit from "./Pages/Brands/BrandEdit";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./Components/PrivateRoute";
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

            {/* Redirect from root to dashboard if logged in, otherwise to login */}
            <Route
              path="/"
              element={
                localStorage.getItem("admin_token") ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Protected routes */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<ProductList />} />
                      <Route
                        path="products/product-list"
                        element={<ProductList />}
                      />
                      <Route path="/products/:id" element={<ProductView />} />
                      <Route
                        path="products/product-upload"
                        element={<ProductUpload />}
                      />
                      {/* Category */}
                      <Route path="category" element={<CategoryList />} />
                      <Route
                        path="category/category-list"
                        element={<CategoryList />}
                      />
                      <Route
                        path="category/category-add"
                        element={<CategoryAdd />}
                      />
                      {/* Brands */}
                      <Route path="brands" element={<BrandList />} />
                      <Route path="brands/brand-list" element={<BrandList />} />
                      <Route path="brands/brand-add" element={<BrandAdd />} />
                      <Route
                        path="brands/brand-edit/:id"
                        element={<BrandEdit />}
                      />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
