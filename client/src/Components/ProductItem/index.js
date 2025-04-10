import { useState, useEffect, useContext, useCallback, memo } from "react";
import { MyContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CiHeart } from "react-icons/ci";
import { IoIosHeart } from "react-icons/io";
import {
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../../services/api";
import ProductModal from "../ProductModal";
import { AiOutlineFullscreen } from "react-icons/ai";
import { Link } from "react-router-dom";
import { addToCart } from "../../services/api";
import Button from "@mui/material/Button";

const ProductItem = memo(({ product, itemView }) => {
  const [isOpenProductModal, setisProductModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const navigate = useNavigate();

  console.log("ProductItem render với:", { product, itemView });

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!product?._id) return;

      try {
        const response = await checkWishlistStatus(product._id);
        setIsLiked(response.isLiked);
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái yêu thích:", error);
      }
    };

    checkLikeStatus();
  }, [product?._id]);

  const handleWishlistClick = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isLoading || !product._id) return;

      if (!context.isLogin) {
        toast.error("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích");
        localStorage.setItem("redirectUrl", window.location.pathname);
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
        return;
      }

      setIsLoading(true);
      try {
        if (isLiked) {
          await removeFromWishlist(product._id);
          setIsLiked(false);
          toast.success("Đã xóa khỏi danh sách yêu thích");
        } else {
          await addToWishlist(product._id);
          setIsLiked(true);
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra, vui lòng thử lại");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, product._id, context.isLogin, isLiked, navigate]
  );

  const viewProductDetails = useCallback(() => {
    setisProductModal(true);
  }, []);

  const closeProductModal = useCallback(() => {
    setisProductModal(false);
  }, []);

  if (!product) {
    console.log("Không có product data");
    return null;
  }

  // Tính giá sau khi giảm giá
  const discountedPrice =
    product.price - (product.price * (product.discount || 0)) / 100;

  // Lấy ảnh đại diện (ảnh đầu tiên từ mảng images)
  const thumbnailImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62-346x310.jpg";
  const isInStock = product?.countInStock > 0;

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

      // Thêm vào giỏ hàng với số lượng mặc định là 1
      const response = await addToCart(product._id, 1);

      if (response) {
        toast.success("Đã thêm sản phẩm vào giỏ hàng!");
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
    <>
      <div
        className={`item productItem ${itemView}`}
        onClick={viewProductDetails}
      >
        <div className="imgWrapper">
          <img
            alt={product.name}
            src={thumbnailImage}
            className="w-100"
            onError={(e) => {
              console.log("Lỗi load ảnh:", e);
              e.target.src =
                "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62-346x310.jpg";
            }}
          />
          {product.discount > 0 && (
            <span className="badge badge-primary">-{product.discount}%</span>
          )}

          <div className="actions">
            <Button
              className="b1"
              onClick={(e) => {
                e.preventDefault(); // Ngăn chặn Link khi click vào nút
                viewProductDetails();
              }}
            >
              <AiOutlineFullscreen />
            </Button>
            <Button
              className="b1"
              onClick={handleWishlistClick}
              disabled={isLoading}
            >
              {isLiked ? (
                <IoIosHeart style={{ color: "red", fill: "red" }} />
              ) : (
                <CiHeart />
              )}
            </Button>
          </div>
        </div>
        <Link
          className="link-product"
          to={`/product/${product._id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <div className="info">
            <h4 className="productName">{product.name}</h4>
            <span
              className={` d-block badge ${
                isInStock ? "bg-success" : "bg-danger"
              }`}
            >
              {isInStock ? "IN STOCK" : "OUT OF STOCK"}
            </span>
            <div className="d-flex">
              <span className="netPrice text-danger ml-2">
                {discountedPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
            </div>
          </div>
        </Link>
        <div className="d-flex align-items-center justify-content-center mb-3">
          <Button
            className="add-to-cart-btn"
            sx={{
              backgroundColor: "transparent",
              border: "2px solid #00aaff", // Blue border
              color: "#00aaff", // Blue text
              fontWeight: "500", // Medium weight
              textTransform: "none", // No uppercase
              borderRadius: "20px", // Rounded corners
              "&:hover": {
                backgroundColor: "#00aaff", // Hover background color
                color: "white", // White text on hover
                borderColor: "#00aaff", // Keep border color blue
              },
            }}
            onClick={handleAddToCart}
            disabled={!isInStock}
          >
            {isInStock ? "Thêm vào giỏ" : "Hết hàng"}
          </Button>
        </div>
      </div>

      {isOpenProductModal && (
        <ProductModal
          productId={product._id}
          closeProductModal={closeProductModal}
        />
      )}
    </>
  );
});

ProductItem.displayName = "ProductItem";

export default ProductItem;
