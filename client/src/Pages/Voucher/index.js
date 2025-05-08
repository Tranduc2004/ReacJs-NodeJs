import React, { useEffect, useState } from "react";
import {
  getVouchers,
  getSavedVouchers,
  saveVoucher,
  isAuthenticated,
} from "../../services/api";
import voucherImg from "../../assets/images/voucher.jpg";
import "./Voucher.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(""); // voucherId đang lưu
  const [savedVoucherIds, setSavedVoucherIds] = useState([]); // lưu các voucherId đã lưu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Lấy danh sách voucher
        const response = await getVouchers();
        // Đảm bảo vouchers luôn là một mảng
        const voucherData = Array.isArray(response)
          ? response
          : response?.data
          ? response.data
          : response?.vouchers
          ? response.vouchers
          : [];
        setVouchers(voucherData);

        // Kiểm tra xác thực trước khi lấy danh sách voucher đã lưu
        if (isAuthenticated()) {
          try {
            const response = await getSavedVouchers();
            if (response.success) {
              setSavedVoucherIds(response.data.map((v) => v._id));
            } else {
              console.error(
                "Lỗi khi lấy danh sách voucher đã lưu:",
                response.message
              );
            }
          } catch (error) {
            console.error("Lỗi khi lấy danh sách voucher đã lưu:", error);
            if (error.response?.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
              navigate("/signin");
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách voucher");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Hàm lưu voucher vào kho cá nhân
  const handleSaveVoucher = async (voucherId) => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá");
      localStorage.setItem("redirectUrl", window.location.pathname);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
      return;
    }

    setSaving(voucherId);
    try {
      const response = await saveVoucher(voucherId);
      if (response.success) {
        setSavedVoucherIds((prev) => [...prev, voucherId]);
        toast.success(response.message || "Đã lưu mã giảm giá vào kho");
      } else {
        if (response.message?.includes("hết lượt")) {
          toast.error(
            "Voucher này đã hết lượt sử dụng, không thể lưu vào kho!"
          );
        } else {
          toast.error(response.message || "Không thể lưu mã giảm giá");
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      if (error.response?.data?.message?.includes("hết lượt")) {
        toast.error("Voucher này đã hết lượt sử dụng, không thể lưu vào kho!");
      } else if (error.response?.data?.message?.includes("đã lưu")) {
        setSavedVoucherIds((prev) => [...prev, voucherId]);
        toast.success("Voucher đã được lưu trước đó");
      } else {
        toast.error(
          error.message || "Không thể lưu mã giảm giá. Vui lòng thử lại sau!"
        );
      }
    } finally {
      setSaving("");
    }
  };

  if (loading) return <div>Đang tải mã giảm giá...</div>;

  return (
    <div className="voucher-container">
      <h2 className="voucher-title">Kho mã giảm giá</h2>
      {!Array.isArray(vouchers) || vouchers.length === 0 ? (
        <div>Không có mã giảm giá nào.</div>
      ) : (
        <div className="voucher-list">
          {vouchers
            .filter((voucher) => voucher.isActive !== false)
            .map((voucher) => (
              <div
                className={`voucher-card-custom${voucher.used ? " used" : ""}`}
                key={voucher._id}
                style={{
                  backgroundImage: `url(${voucherImg})`,
                  opacity: voucher.used ? 0.6 : 1,
                  position: "relative",
                  pointerEvents: voucher.used ? "none" : "auto",
                }}
              >
                {/* Ribbon Đã dùng */}
                {voucher.used && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "#bdbdbd",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 13,
                      padding: "2px 16px",
                      borderTopRightRadius: 12,
                      borderBottomLeftRadius: 12,
                      zIndex: 2,
                      boxShadow: "0 2px 8px rgba(67,160,71,0.15)",
                    }}
                  >
                    Đã sử dụng
                  </div>
                )}
                <div className="voucher-left">
                  <div className="voucher-shop-icon">
                    <span role="img" aria-label="shop">
                      🛍️
                    </span>
                  </div>
                  <div className="voucher-shop-name">{voucher.name}</div>
                  <div className="voucher-expiry">
                    HSD: {new Date(voucher.endDate).toLocaleDateString()}
                  </div>
                  {voucher.used && (
                    <div
                      style={{
                        color: "#bdbdbd",
                        fontSize: "0.9em",
                        marginTop: "5px",
                      }}
                    >
                      Voucher này đã được sử dụng và không thể sử dụng lại
                    </div>
                  )}
                </div>
                <div className="voucher-right">
                  <div className="voucher-discount">
                    Giảm{" "}
                    <span className="voucher-discount-value">
                      {voucher.discountType === "PERCENTAGE"
                        ? `${voucher.discountValue}%`
                        : `${voucher.discountValue.toLocaleString()}đ`}
                    </span>
                  </div>
                  <div className="voucher-min-order">
                    ĐH tối thiểu:{" "}
                    {voucher.minOrderValue
                      ? voucher.minOrderValue.toLocaleString() + "đ"
                      : "Không"}
                  </div>
                  {voucher.description && (
                    <div className="voucher-note">
                      <b>Lưu ý:</b>{" "}
                      {voucher.description.length > 40
                        ? voucher.description.slice(0, 40) + "..."
                        : voucher.description}
                    </div>
                  )}
                  <div className="voucher-actions">
                    {voucher.used === true ? (
                      <button
                        className="voucher-btn-custom"
                        disabled
                        style={{
                          cursor: "not-allowed",
                          background: "#bdbdbd",
                          color: "#fff",
                        }}
                      >
                        Đã sử dụng
                      </button>
                    ) : voucher.usedCount >= voucher.usageLimit ? (
                      <button
                        className="voucher-btn-custom"
                        disabled
                        style={{
                          cursor: "not-allowed",
                          background: "#bdbdbd",
                          color: "#fff",
                        }}
                      >
                        Hết lượt
                      </button>
                    ) : (
                      <button
                        className="voucher-btn-custom"
                        disabled={
                          saving === voucher._id ||
                          savedVoucherIds.includes(voucher._id)
                        }
                        onClick={() => handleSaveVoucher(voucher._id)}
                      >
                        {savedVoucherIds.includes(voucher._id)
                          ? "Đã lưu vào kho"
                          : saving === voucher._id
                          ? "Đang lưu..."
                          : "Lưu vào kho"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default VoucherList;
