import React, { useEffect, useState } from "react";
import { getSavedVouchers, removeSavedVoucher } from "../../services/api";
import voucherImg from "../../assets/images/voucher.jpg";
import "../Voucher/Voucher.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const MyVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(""); // voucherId đang xóa
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await getSavedVouchers();

      if (response.success) {
        const voucherData = Array.isArray(response.data) ? response.data : [];
        setVouchers(voucherData);
      } else {
        console.error("Lỗi khi lấy danh sách voucher:", response.message);
        toast.error(response.message || "Không thể lấy danh sách mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách voucher:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        navigate("/signin");
      } else {
        toast.error("Có lỗi xảy ra khi tải danh sách mã giảm giá");
      }
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [navigate]);

  // Hàm xóa voucher
  const handleRemoveVoucher = async (voucherId) => {
    try {
      setRemoving(voucherId);
      const response = await removeSavedVoucher(voucherId);

      if (response.success) {
        // Cập nhật danh sách voucher sau khi xóa
        setVouchers((prevVouchers) =>
          prevVouchers.filter((voucher) => voucher._id !== voucherId)
        );
        toast.success(response.message || "Đã xóa mã giảm giá khỏi kho");
      } else {
        toast.error(response.message || "Không thể xóa mã giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi xóa voucher:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa mã giảm giá");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <div>Đang tải mã giảm giá của bạn...</div>;

  return (
    <div className="voucher-container">
      <h2 className="voucher-title">Mã giảm giá của tôi</h2>
      {!Array.isArray(vouchers) || vouchers.length === 0 ? (
        <div>Bạn chưa lưu mã giảm giá nào.</div>
      ) : (
        <div className="voucher-list">
          {vouchers.map((voucher) => (
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
                  {voucher.used ? (
                    <button
                      className="voucher-btn-custom remove"
                      disabled
                      style={{
                        cursor: "not-allowed",
                        background: "#bdbdbd",
                        color: "#fff",
                      }}
                    >
                      Đã sử dụng
                    </button>
                  ) : (
                    <button
                      className="voucher-btn-custom remove"
                      disabled={removing === voucher._id}
                      onClick={() => handleRemoveVoucher(voucher._id)}
                    >
                      {removing === voucher._id
                        ? "Đang xóa..."
                        : "Xóa khỏi kho"}
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

export default MyVoucher;
