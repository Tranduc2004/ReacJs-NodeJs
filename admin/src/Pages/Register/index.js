import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { BsTwitter } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";
import logo from "../../assets/images/logo.webp";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <h1>
          BEST UX/UI FASHION
          <br />
          ECOMMERCE DASHBOARD
          <br />& ADMIN PANEL
        </h1>
        <p>
          Elit lusto dolore libero recusandae dolor dolores explicabo ullam cum
          facilis aperiam alias odio quam excepturi molestiae omnis inventore.
          Repudiandae officia placeat amet consectetur dicta dolorem quo
        </p>
        <Link to="/" className="btn btn-light">
          GO TO HOME
        </Link>
      </div>

      <div className="register-box">
        <div className="text-center mb-4">
          <img src={logo} alt="logo" className="register-logo mb-2" />
          <h4>Register a new account</h4>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaUser />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="enter your name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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

          <div className="form-group mb-3">
            <div className="input-group">
              <span className="input-icon">
                <FaLock />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control"
                placeholder="confirm your password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            <label className="form-check-label" htmlFor="agreeToTerms">
              I agree to the all Terms & Conditions
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            SIGN UP
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="btn btn-twitter w-100 mb-2">
              <BsTwitter className="social-icon" />
              Continue with Twitter
            </button>

            <button type="button" className="btn btn-facebook w-100 mb-2">
              <FaFacebookF className="social-icon" />
              Continue with Facebook
            </button>
          </div>

          <div className="text-center mt-4">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="login-link">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
