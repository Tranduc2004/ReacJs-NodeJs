import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { AiOutlineFullscreen } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import ProductModal from "../ProductModal";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MyContext } from "../../App";
import { addToCart } from "../../services/api";
import { toast } from "react-hot-toast";

const ProductItem = ({ product, itemView }) => {
  const [isOpenProductModal, setisProductModal] = useState(false);
  const navigate = useNavigate();
  const context = useContext(MyContext);

  const viewProductDetails = () => {
    setisProductModal(true);
  };

  if (!product) {
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
      <div className={`item productItem ${itemView}`}>
        <div className="imgWrapper">
          <img alt={product.name} src={thumbnailImage} className="w-100" />
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
            <Button className="b1" onClick={(e) => e.preventDefault()}>
              <CiHeart />
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
              className={`instock d-block ${
                isInStock ? "text-success" : "text-danger"
              }`}
            >
              {isInStock ? "IN STOCK" : "OUT OF STOCK"}
            </span>
            <Rating
              className="mt-2 mb-2"
              name="read-only"
              value={product.rating || 0}
              readOnly
              size="small"
              precision={0.5}
            />

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
            className="btn-lg btn-big btn-round"
            sx={{
              backgroundColor: "#00aaff",
              color: "white",
              "&:hover": {
                backgroundColor: "#0088cc",
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
          closeProductModal={() => setisProductModal(false)}
        />
      )}
    </>
  );
};

export default ProductItem;
