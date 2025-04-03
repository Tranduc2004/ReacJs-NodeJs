import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/images/logo.webp";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  const handleGoogleLogin = () => {
    // Xử lý đăng nhập bằng Google
    console.log("Google login");
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="text-center mb-4">
          <img src={logo} alt="logo" className="login-logo mb-2" />
          <h4>Login to Hotash</h4>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaEnvelope />
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="enter your email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="enter your password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Sign In
          </button>

          <div className="text-center mb-3">
            <Link to="/forgot-password" className="forgot-link">
              FORGOT PASSWORD
            </Link>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="btn btn-google w-100"
            onClick={handleGoogleLogin}
          >
            <FcGoogle className="google-icon" />
            Sign In With Google
          </button>

          <div className="text-center mt-4">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="register-link">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
