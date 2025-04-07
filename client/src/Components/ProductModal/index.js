import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineCompareArrows } from "react-icons/md";
import "swiper/css";
import { useState, useEffect, useContext } from "react";
import { getProductById, getBrands, addToCart } from "../../services/api";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import QuantityBox from "../QuantityBox";
import ProductZoom from "../ProductZoom";

const ProductModal = ({ closeProductModal, productId }) => {
  const [product, setProduct] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(productId);
        setProduct(data);

        // Kiểm tra nếu brand đã được populate
        if (data.brand && typeof data.brand === "object") {
          setBrandName(data.brand.name);
        }
        // Nếu brand chỉ là ID, thì mới cần fetch brands
        else if (data.brand) {
          const brands = await getBrands();
          const brand = brands.find((b) => b._id === data.brand);
          if (brand) {
            setBrandName(brand.name);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return null;
  }

  // Tính giá sau khi giảm giá
  const discountedPrice =
    product?.price - (product?.price * (product?.discount || 0)) / 100;
  const isInStock = product?.countInStock > 0;

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Kiểm tra đăng nhập từ context
      if (!context.isLogin) {
        toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        localStorage.setItem("redirectUrl", window.location.pathname);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
        return;
      }

      // Kiểm tra số lượng
      if (!quantity || quantity < 1) {
        toast.error("Vui lòng chọn số lượng hợp lệ");
        return;
      }

      // Thêm vào giỏ hàng với số lượng đã chọn
      const response = await addToCart(product._id, quantity);

      if (response) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
        closeProductModal();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng");
      }
    }
  };

  return (
    <Dialog
      open={true}
      className="productModal"
      onClose={closeProductModal}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "800px",
          padding: "20px",
          position: "relative",
        },
      }}
    >
      {/* Close Button */}
      <Button
        onClick={closeProductModal}
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          minWidth: "auto",
          padding: "5px",
          fontSize: "25px",
          background: "#c2c2d3",
          color: "#fff",
          borderRadius: "50%",
        }}
      >
        <MdClose />
      </Button>

      {/* Product Title & Brand */}
      <h4 className="mb-1 font-weight-bold">{product?.name}</h4>
      <div className="d-flex align-items-center">
        <span className="mr-2">
          Brands: <b>{brandName || "No Brand"}</b>
        </span>
        <Rating
          name="read-only"
          value={product?.rating || 0}
          size="small"
          precision={0.5}
          readOnly
        />
      </div>
      <hr />

      <div className="row mt-2">
        <div className="col-md-5">
          <ProductZoom product={product} />
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <div className="d-flex align-items-center mb-3">
            {product?.discount > 0 && (
              <span className="oldPrice lg mr-2">{product?.price}</span>
            )}
            <span className="netPrice text-danger lg">
              <span className="netPrice text-danger ml-2">
                {discountedPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </span>
          </div>
          <span className={`badge  ${isInStock ? "bg-success" : "bg-danger"}`}>
            {isInStock ? "IN STOCK" : "OUT OF STOCK"}
          </span>
          <p className="mt-3"></p>

          {/* Quantity & Add to Cart */}
          <div className="d-flex align-items-center">
            <QuantityBox
              quantity={quantity}
              onIncrease={handleIncreaseQuantity}
              onDecrease={handleDecreaseQuantity}
            />
            <Button
              className="btn-lg btn-big btn-round ml-3"
              sx={{
                backgroundColor: "#00aaff",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0088cc",
                },
              }}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
          </div>

          {/* Wishlist & Compare */}
          <div className="d-flex align-items-center mt-5 actions">
            <Button className="btn-round btn-sml" variant="outlined">
              <IoIosHeartEmpty /> &nbsp; ADD TO WISHLIST
            </Button>
            <Button className="btn-round btn-sml ml-3" variant="outlined">
              <MdOutlineCompareArrows /> &nbsp; COMPARE
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal;
