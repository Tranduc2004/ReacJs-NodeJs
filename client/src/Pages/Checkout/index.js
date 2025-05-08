import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  FormControl,
  Card,
  CardContent,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IoLocationSharp, IoCardSharp } from "react-icons/io5";
import { FaMoneyBillWave, FaWallet, FaTicketAlt } from "react-icons/fa";
import { getCart, getSavedVouchers } from "../../services/api";
import { toast } from "react-hot-toast";
import axios from "axios";
import voucherImg from "../../assets/images/voucher.jpg";
import "../Voucher/Voucher.css";

// Set baseURL for axios
axios.defaults.baseURL = "http://localhost:4000";

const Checkout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    cityName: "",
    district: "",
    districtName: "",
    ward: "",
    wardName: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);

  // Address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [openVoucherDialog, setOpenVoucherDialog] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    // Get user info from localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);

      // Pre-fill user data if available
      if (userData.fullName) {
        setFormData((prev) => ({
          ...prev,
          fullName: userData.fullName || "",
          phone: userData.phone || "",
        }));
      }
    }

    // Fetch cart data
    const fetchCart = async () => {
      try {
        const response = await getCart();
        if (!response.items || response.items.length === 0) {
          toast.error("Giỏ hàng trống");
          navigate("/cart");
          return;
        }
        setCartItems(response.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    // Fetch provinces
    const fetchProvinces = async () => {
      try {
        const response = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
      }
    };

    fetchCart();
    fetchProvinces();
  }, [navigate]);

  // Fetch districts when province changes
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const selectedProvince = provinces.find((p) => p.code === provinceCode);

    setFormData({
      ...formData,
      city: provinceCode,
      cityName: selectedProvince ? selectedProvince.name : "",
      district: "",
      districtName: "",
      ward: "",
      wardName: "",
    });

    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      setDistricts(data.districts || []);
      setWards([]);
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast.error("Không thể tải danh sách quận/huyện");
    }
  };

  // Fetch wards when district changes
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    const selectedDistrict = districts.find((d) => d.code === districtCode);

    setFormData({
      ...formData,
      district: districtCode,
      districtName: selectedDistrict ? selectedDistrict.name : "",
      ward: "",
      wardName: "",
    });

    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`
      );
      const data = await response.json();
      setWards(data.wards || []);
    } catch (error) {
      console.error("Error fetching wards:", error);
      toast.error("Không thể tải danh sách phường/xã");
    }
  };

  // Update ward when selected
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const selectedWard = wards.find((w) => w.code === wardCode);

    setFormData({
      ...formData,
      ward: wardCode,
      wardName: selectedWard ? selectedWard.name : "",
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.phone) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9]{10}$/.test(formData.phone))
      newErrors.phone = "Số điện thoại phải có 10 chữ số";

    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.city) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường/xã";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Thêm useEffect để lấy danh sách voucher
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await getSavedVouchers();
        if (response.success) {
          setVouchers(response.data || []);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách voucher:", error);
      }
    };
    fetchVouchers();
  }, []);

  // Hàm tính số tiền giảm giá dựa trên voucher và tổng tiền
  const calculateDiscountAmount = (voucher, subtotal) => {
    if (!voucher) return 0;
    const type = voucher.type || voucher.discountType;
    const value = Number(voucher.value || voucher.discountValue);

    // Lấy danh sách sản phẩm và danh mục áp dụng
    const applicableProducts = voucher.applicableProducts || [];
    const applicableCategories = voucher.applicableCategories || [];

    // Tính tổng tiền các sản phẩm được áp dụng giảm giá
    let eligibleTotal = 0;
    if (applicableProducts.length > 0 || applicableCategories.length > 0) {
      eligibleTotal = cartItems.reduce((total, item) => {
        if (!item || !item.product) return total;
        const productId = item.product._id || item.product;
        const categoryId = item.product.category?._id || item.product.category;
        const inProduct = applicableProducts.some(
          (p) => p._id === productId || p === productId
        );
        const inCategory = applicableCategories.some(
          (c) => c._id === categoryId || c === categoryId
        );
        if (inProduct || inCategory) {
          const discount = item.product.discount || 0;
          const price = item.product.price || item.price;
          const discountedPrice = price * (1 - discount / 100);
          return total + discountedPrice * item.quantity;
        }
        return total;
      }, 0);
    } else {
      eligibleTotal = subtotal;
    }

    // Ép cứng maxDiscount = 80000 nếu là mã GIAMGIA50% để test
    let maxDiscount = 0;
    if (voucher.code === "GIAMGIA50%") {
      maxDiscount = 80000;
    } else if (
      voucher.maxDiscountAmount !== undefined &&
      voucher.maxDiscountAmount !== null &&
      !isNaN(Number(voucher.maxDiscountAmount)) &&
      Number(voucher.maxDiscountAmount) > 0
    ) {
      maxDiscount = Number(voucher.maxDiscountAmount);
    } else if (
      voucher.maxDiscount !== undefined &&
      voucher.maxDiscount !== null &&
      !isNaN(Number(voucher.maxDiscount)) &&
      Number(voucher.maxDiscount) > 0
    ) {
      maxDiscount = Number(voucher.maxDiscount);
    }

    if (
      voucher.minOrderValue &&
      eligibleTotal < Number(voucher.minOrderValue)
    ) {
      return 0;
    }
    if (type === "PERCENTAGE") {
      const percentDiscount = (eligibleTotal * value) / 100;
      if (maxDiscount > 0) {
        return Math.min(percentDiscount, maxDiscount);
      }
      return percentDiscount;
    }
    return value > 0 ? Math.min(value, eligibleTotal) : 0;
  };

  // Tự động cập nhật discountAmount khi selectedVoucher hoặc cartItems thay đổi
  useEffect(() => {
    const subtotal = calculateSubtotal();
    setDiscountAmount(calculateDiscountAmount(selectedVoucher, subtotal));
  }, [selectedVoucher, cartItems]);

  // Sửa lại hàm handleSelectVoucher: kiểm tra sản phẩm/danh mục trước khi set
  const handleSelectVoucher = (voucher) => {
    // Kiểm tra nếu voucher có điều kiện sản phẩm/danh mục
    const applicableProducts = voucher.applicableProducts || [];
    const applicableCategories = voucher.applicableCategories || [];
    let hasEligible = false;
    if (applicableProducts.length > 0 || applicableCategories.length > 0) {
      hasEligible = cartItems.some((item) => {
        if (!item || !item.product) return false;
        const productId = item.product._id || item.product;
        const categoryId = item.product.category?._id || item.product.category;
        const inProduct = applicableProducts.some(
          (p) => p._id === productId || p === productId
        );
        const inCategory = applicableCategories.some(
          (c) => c._id === categoryId || c === categoryId
        );
        return inProduct || inCategory;
      });
      if (!hasEligible) {
        toast.error(
          "Voucher này chỉ áp dụng cho một số sản phẩm/danh mục nhất định. Giỏ hàng của bạn hiện không có sản phẩm phù hợp."
        );
        setOpenVoucherDialog(false);
        return;
      }
    }
    setSelectedVoucher(voucher);
    setOpenVoucherDialog(false);
  };

  // Hàm xử lý xóa voucher đã chọn
  const handleRemoveVoucher = () => {
    setSelectedVoucher(null);
    setDiscountAmount(0);
  };

  // Sửa lại hàm tính tổng tiền chỉ trả về tổng tiền hàng (chưa trừ giảm giá)
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      if (!item || !item.product) return total;
      const discount = item.product.discount || 0;
      const price = item.product.price || item.price;
      const discountedPrice = price * (1 - discount / 100);
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  // Thêm Dialog chọn voucher
  const VoucherDialog = () => (
    <Dialog
      open={openVoucherDialog}
      onClose={() => setOpenVoucherDialog(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <FaTicketAlt style={{ marginRight: 8 }} />
          Chọn mã giảm giá
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* Custom voucher card giống MyVoucher */}
        <div className="voucher-list">
          {vouchers.length === 0 ? (
            <div>Bạn chưa có mã giảm giá nào</div>
          ) : (
            vouchers.map((voucher) => {
              const total = calculateSubtotal();
              let discount = 0;
              let conditionText = "";
              const type = voucher.type || voucher.discountType;
              const value = voucher.value || voucher.discountValue;
              // Lấy đúng trường maxDiscountAmount hoặc maxDiscount
              const maxDiscount =
                voucher.maxDiscountAmount || voucher.maxDiscount || 0;
              // Kiểm tra điều kiện đơn tối thiểu
              if (
                voucher.minOrderValue &&
                total < Number(voucher.minOrderValue)
              ) {
                conditionText = "Chưa đủ điều kiện";
              } else {
                if (type === "PERCENTAGE") {
                  discount = (total * Number(value)) / 100;
                  if (maxDiscount > 0) {
                    discount = Math.min(discount, Number(maxDiscount));
                  }
                } else {
                  discount = Number(value) || 0;
                }
                conditionText = `Giảm ${discount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}`;
              }
              return (
                <div
                  className={`voucher-card-custom${
                    selectedVoucher?._id === voucher._id ? " selected" : ""
                  }${voucher.used ? " used" : ""}`}
                  key={voucher._id}
                  style={{
                    backgroundImage: `url(${voucherImg})`,
                    cursor: voucher.used
                      ? "not-allowed"
                      : voucher.minOrderValue &&
                        total < Number(voucher.minOrderValue)
                      ? "not-allowed"
                      : "pointer",
                    opacity: voucher.used
                      ? 0.6
                      : voucher.minOrderValue &&
                        total < Number(voucher.minOrderValue)
                      ? 0.6
                      : 1,
                    pointerEvents: voucher.used ? "none" : "auto",
                    position: "relative",
                  }}
                  onClick={() => {
                    if (
                      !voucher.used &&
                      !(
                        voucher.minOrderValue &&
                        total < Number(voucher.minOrderValue)
                      )
                    )
                      handleSelectVoucher(voucher);
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
                  </div>
                  <div className="voucher-right">
                    <div className="voucher-discount">
                      Giảm{" "}
                      <span className="voucher-discount-value">
                        {type === "PERCENTAGE"
                          ? `${value}%${
                              maxDiscount > 0
                                ? ` (tối đa ${Number(
                                    maxDiscount
                                  ).toLocaleString("vi-VN")}đ)`
                                : ""
                            }`
                          : `${Number(value).toLocaleString()}đ`}
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
                      {selectedVoucher?._id === voucher._id ? (
                        <button
                          className="voucher-btn-custom remove"
                          onClick={handleRemoveVoucher}
                        >
                          Bỏ chọn
                        </button>
                      ) : (
                        <button
                          className="voucher-btn-custom"
                          disabled={
                            voucher.used ||
                            (voucher.minOrderValue &&
                              total < Number(voucher.minOrderValue))
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              !voucher.used &&
                              !(
                                voucher.minOrderValue &&
                                total < Number(voucher.minOrderValue)
                              )
                            )
                              handleSelectVoucher(voucher);
                          }}
                        >
                          {voucher.used ? "Đã sử dụng" : "Áp dụng"}
                        </button>
                      )}
                    </div>
                    <div
                      className="voucher-condition"
                      style={{
                        color:
                          voucher.minOrderValue &&
                          total < Number(voucher.minOrderValue)
                            ? "red"
                            : "#43a047",
                        fontWeight: 500,
                        marginTop: 4,
                      }}
                    >
                      {conditionText}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenVoucherDialog(false)}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra dữ liệu trước khi gửi
      if (!user?._id) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Giỏ hàng trống");
      }

      const totalAmount = calculateSubtotal();
      if (totalAmount <= 0) {
        throw new Error("Tổng tiền không hợp lệ");
      }

      // Chuẩn bị dữ liệu đơn hàng
      if (selectedVoucher && selectedVoucher.used) {
        toast.error("Voucher này đã được sử dụng, vui lòng chọn voucher khác!");
        setIsSubmitting(false);
        return;
      }
      const orderPayload = {
        userId: user._id,
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          image:
            item.product.image ||
            (item.product.images && item.product.images[0]) ||
            "",
        })),
        totalAmount: calculateSubtotal(),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.cityName,
          district: formData.districtName,
          ward: formData.wardName,
        },
        note: note || "",
        paymentMethod: paymentMethod,
        voucher: selectedVoucher?._id,
        discountAmount: discountAmount,
        finalAmount: (calculateSubtotal() || 0) - (discountAmount || 0),
      };

      // If payment method is MoMo, proceed with MoMo payment
      if (paymentMethod === "MOMO") {
        await handleMomoPayment();
      } else {
        // For COD, create order directly
        try {
          const orderResponse = await axios.post("/api/orders", orderPayload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (orderResponse.data.success) {
            toast.success("Đặt hàng thành công!");
            navigate("/thank-you", {
              state: {
                order: orderResponse.data.data,
                message: "Đơn hàng của bạn đã được đặt thành công!",
              },
            });
          } else {
            throw new Error("Không thể tạo đơn hàng");
          }
        } catch (error) {
          console.error("Lỗi khi tạo đơn hàng:", error);
          setError(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
          toast.error(error.response?.data?.message || "Lỗi khi tạo đơn hàng");
        }
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      setError(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
      toast.error(error.message || "Có lỗi xảy ra khi xử lý đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Thêm useEffect để kiểm tra trạng thái đơn hàng sau khi thanh toán
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const orderId = localStorage.getItem("orderId");
      const isReturningFromPayment = localStorage.getItem(
        "isReturningFromPayment"
      );

      if (!orderId || !isReturningFromPayment) return;

      console.log("Checking payment status for order:", orderId);

      try {
        const response = await axios.get(`/api/momo/status/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Payment status response:", response.data);

        if (response.data.success) {
          const { paymentStatus, orderStatus } = response.data.data;

          if (paymentStatus === "PAID" && orderStatus === "PROCESSING") {
            // Thanh toán thành công
            console.log("Payment successful, redirecting to thank you page");
            toast.success("Thanh toán thành công!");
            localStorage.removeItem("orderId");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("isReturningFromPayment");
            navigate("/thank-you", {
              state: {
                order: response.data.data,
                message: "Đơn hàng của bạn đã được thanh toán thành công!",
              },
            });
          } else if (paymentStatus === "FAILED") {
            // Thanh toán thất bại
            console.log("Payment failed");
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
            localStorage.removeItem("orderId");
            localStorage.removeItem("pendingOrder");
            localStorage.removeItem("isReturningFromPayment");
          }
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
      }
    };

    // Kiểm tra trạng thái mỗi 3 giây
    const interval = setInterval(checkPaymentStatus, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Thêm useEffect để kiểm tra khi quay lại từ trang thanh toán MoMo
  useEffect(() => {
    const checkReturnFromPayment = async () => {
      const momoOrderId = localStorage.getItem("momoOrderId");
      const isReturning = localStorage.getItem("isReturningFromPayment");

      if (momoOrderId && isReturning === "true") {
        try {
          console.log("Checking order status for:", momoOrderId);
          const response = await axios.get(
            `http://localhost:4000/api/momo/status/${momoOrderId}`
          );

          if (response.data.success) {
            const { paymentStatus, orderStatus } = response.data.data;

            if (paymentStatus === "PAID" && orderStatus === "PROCESSING") {
              toast.success(
                "Thanh toán thành công!Hãy kiểm tra Gmail để xác nhận đơn hàng"
              );
              localStorage.removeItem("momoOrderId");
              localStorage.removeItem("isReturningFromPayment");
              navigate("/thank-you");
            } else if (
              paymentStatus === "FAILED" ||
              orderStatus === "CANCELLED"
            ) {
              toast.error("Thanh toán thất bại. Vui lòng thử lại.");
              localStorage.removeItem("momoOrderId");
              localStorage.removeItem("isReturningFromPayment");
            }
          }
        } catch (error) {
          console.error(
            "Lỗi khi kiểm tra trạng thái thanh toán sau khi quay lại:",
            error
          );
          if (error.response?.status === 404) {
            toast.error("Không tìm thấy đơn hàng. Vui lòng thử lại.");
            localStorage.removeItem("momoOrderId");
            localStorage.removeItem("isReturningFromPayment");
          }
        }
      }
    };

    // Kiểm tra ngay khi component mount
    checkReturnFromPayment();
  }, [navigate]);

  // Xử lý thanh toán MoMo
  const handleMomoPayment = async () => {
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.price,
          name: item.product.name,
          image: item.product.images?.[0] || "",
          description: item.product.description,
        })),
        totalAmount: calculateSubtotal(),
        userId: user._id,
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          city: formData.cityName,
          district: formData.districtName,
          ward: formData.wardName,
        },
        note: note,
        paymentMethod: "MOMO",
      };

      console.log("Sending order data:", orderData);

      const response = await axios.post(
        "/api/momo/create",
        { orderData },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          baseURL: "http://localhost:4000",
        }
      );

      console.log("MoMo API response:", response.data);

      if (response.data.success) {
        // Lưu momoOrderId vào localStorage
        localStorage.setItem("momoOrderId", response.data.data.momoOrderId);
        localStorage.setItem("isReturningFromPayment", "true");

        // Chuyển hướng đến trang thanh toán MoMo
        window.location.href = response.data.data.payUrl;
      } else {
        toast.error(response.data.message || "Lỗi khi tạo thanh toán");
      }
    } catch (error) {
      console.error("Error in handleMomoPayment:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi tạo thanh toán MoMo"
      );
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Đang tải thông tin...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Thanh toán
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Shipping Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <IoLocationSharp /> Thông tin giao hàng
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Tỉnh/Thành phố"
                      name="city"
                      value={formData.city}
                      onChange={handleProvinceChange}
                      error={!!errors.city}
                      helperText={errors.city}
                      required
                    >
                      <MenuItem value="">Chọn tỉnh/thành phố</MenuItem>
                      {provinces.map((province) => (
                        <MenuItem key={province.code} value={province.code}>
                          {province.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Quận/Huyện"
                      name="district"
                      value={formData.district}
                      onChange={handleDistrictChange}
                      error={!!errors.district}
                      helperText={errors.district}
                      disabled={!formData.city}
                      required
                    >
                      <MenuItem value="">Chọn quận/huyện</MenuItem>
                      {districts.map((district) => (
                        <MenuItem key={district.code} value={district.code}>
                          {district.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <TextField
                      select
                      fullWidth
                      label="Phường/Xã"
                      name="ward"
                      value={formData.ward}
                      onChange={handleWardChange}
                      error={!!errors.ward}
                      helperText={errors.ward}
                      disabled={!formData.district}
                      required
                    >
                      <MenuItem value="">Chọn phường/xã</MenuItem>
                      {wards.map((ward) => (
                        <MenuItem key={ward.code} value={ward.code}>
                          {ward.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    <IoCardSharp /> Phương thức thanh toán
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          border:
                            paymentMethod === "COD"
                              ? "2px solid #00aaff"
                              : "1px solid #ddd",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#00aaff",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => setPaymentMethod("COD")}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <FaMoneyBillWave
                              size={24}
                              color={
                                paymentMethod === "COD" ? "#00aaff" : "#666"
                              }
                            />
                            <Typography
                              variant="h6"
                              sx={{
                                ml: 1,
                                color:
                                  paymentMethod === "COD"
                                    ? "#00aaff"
                                    : "inherit",
                              }}
                            >
                              COD
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Thanh toán khi nhận hàng
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          border:
                            paymentMethod === "MOMO"
                              ? "2px solid #00aaff"
                              : "1px solid #ddd",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            borderColor: "#00aaff",
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          },
                        }}
                        onClick={() => setPaymentMethod("MOMO")}
                      >
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <FaWallet
                              size={24}
                              color={
                                paymentMethod === "MOMO" ? "#00aaff" : "#666"
                              }
                            />
                            <Typography
                              variant="h6"
                              sx={{
                                ml: 1,
                                color:
                                  paymentMethod === "MOMO"
                                    ? "#00aaff"
                                    : "inherit",
                              }}
                            >
                              MoMo
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Thanh toán qua ví MoMo
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
                <Box sx={{ mt: 4, width: "100%" }}>
                  <Typography variant="h6" gutterBottom>
                    <IoCardSharp /> Ghi chú đơn hàng
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e0e0e0",
                      borderRadius: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Ví dụ: Giao hàng trong giờ hành chính, gọi điện trước khi giao,..."
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "white",
                          "&:hover fieldset": {
                            borderColor: "#00aaff",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#00aaff",
                          },
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color: "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      * Thêm ghi chú để chúng tôi phục vụ bạn tốt hơn
                    </Typography>
                  </Paper>
                </Box>
              </Grid>
              <Box sx={{ mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  style={{ backgroundColor: "#00aaff" }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{ mr: 1, color: "white" }}
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng"
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tóm tắt đơn hàng
            </Typography>
            <Divider sx={{ my: 2 }} />
            {cartItems.map((item) => (
              <Box key={item.product._id} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <img
                      src={item.product.images?.[0] || ""}
                      alt={item.product.name}
                      style={{ width: "100%", borderRadius: "4px" }}
                    />
                  </Grid>
                  <Grid item xs={9}>
                    <Typography variant="subtitle1">
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Giá:{" "}
                      {item.product.discount > 0 ? (
                        <>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#888",
                              marginRight: 4,
                            }}
                          >
                            {item.product.price.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </span>
                          <span style={{ color: "#ed174a", fontWeight: 600 }}>
                            {(
                              item.product.price *
                              (1 - item.product.discount / 100)
                            ).toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}
                          </span>
                        </>
                      ) : (
                        <span>
                          {item.product.price.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          })}
                        </span>
                      )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Thành tiền:{" "}
                      {(item.product.discount > 0
                        ? item.product.price *
                          (1 - item.product.discount / 100) *
                          item.quantity
                        : item.product.price * item.quantity
                      ).toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />

            {/* Voucher Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Mã giảm giá
              </Typography>
              {selectedVoucher ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#e0f7fa",
                    border: "2px solid #00bcd4",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: "0 2px 8px rgba(0,188,212,0.12)",
                    mb: 1,
                    position: "relative",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <FaTicketAlt
                      color="#00bcd4"
                      style={{ marginRight: 8, fontSize: 22 }}
                    />
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: "#00bcd4", fontSize: 18 }}
                      >
                        {selectedVoucher.code}
                        <span
                          style={{
                            background: "#00bcd4",
                            color: "#fff",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "2px 8px",
                            marginLeft: 10,
                            verticalAlign: "middle",
                          }}
                        >
                          Đã áp dụng
                        </span>
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#0097a7",
                          fontWeight: 500,
                          fontSize: 15,
                          display: "block",
                        }}
                      >
                        {discountAmount > 0
                          ? `Giảm ${discountAmount.toLocaleString("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            })}`
                          : selectedVoucher &&
                            (selectedVoucher.applicableProducts?.length > 0 ||
                              selectedVoucher.applicableCategories?.length > 0)
                          ? "Voucher này chỉ áp dụng cho một số sản phẩm/danh mục nhất định. Giỏ hàng của bạn hiện không có sản phẩm phù hợp."
                          : "Không có giảm giá"}
                      </Typography>
                    </Box>
                  </Box>
                  {/* Badge Xóa voucher */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={handleRemoveVoucher}
                      sx={{
                        background: "#ff1744",
                        color: "#fff",
                        p: 0.5,
                        "&:hover": {
                          background: "#d50000",
                        },
                        boxShadow: "0 2px 8px rgba(255,23,68,0.15)",
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 6h18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <rect
                          x="5"
                          y="6"
                          width="14"
                          height="14"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M10 11v4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 11v4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <Button
                  startIcon={
                    <FaTicketAlt style={{ fontSize: 22, color: "#00bcd4" }} />
                  }
                  onClick={() => setOpenVoucherDialog(true)}
                  variant="outlined"
                  fullWidth
                  sx={{
                    borderRadius: 3,
                    border: "2px solid #00bcd4",
                    background: "#fff",
                    color: "#00bcd4",
                    fontWeight: 700,
                    fontSize: 17,
                    py: 1.2,
                    boxShadow: "0 2px 8px rgba(0,188,212,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    "&:hover": {
                      background: "#e0f7fa",
                      borderColor: "#0097a7",
                      color: "#0097a7",
                      boxShadow: "0 4px 16px rgba(0,188,212,0.15)",
                    },
                    "&:active": {
                      background: "#b2ebf2",
                      borderColor: "#00bcd4",
                    },
                  }}
                >
                  Chọn Mã Giảm Giá
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Total Section */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body1">Tạm tính:</Typography>
              <Typography variant="body1">
                {(calculateSubtotal() || 0).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Typography>
            </Box>

            {discountAmount > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body1" color="error">
                  Giảm giá:
                </Typography>
                <Typography variant="body1" color="error">
                  -
                  {(discountAmount || 0).toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  })}
                </Typography>
              </Box>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Tổng cộng:</Typography>
              <Typography variant="h6" color="red">
                {(
                  (calculateSubtotal() || 0) - (discountAmount || 0)
                ).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Voucher Dialog */}
        <VoucherDialog />
      </Grid>
    </Container>
  );
};

export default Checkout;
