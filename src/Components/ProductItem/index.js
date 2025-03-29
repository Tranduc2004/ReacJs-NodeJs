import Rating from "@mui/material/Rating";
import Button from "@mui/material/Button";
import { AiOutlineFullscreen } from "react-icons/ai";
import { CiHeart } from "react-icons/ci";
import ProductModal from "../ProductModal";
import { useState } from "react";

const ProductItem = () => {
  const [isOpenProductModal, setisProductModal] = useState(false);

  const viewProductDetails = (id) => {
    setisProductModal(true);
  };

  return (
    <>
        <div className="item productItem">
          <div className="imgWrapper">
            <img
              alt=""
              src="https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62-346x310.jpg"
              className="w-100"
            />
            <span className="badge badge-primary">-20%</span>
            <div className="actions">
              <Button className="b1" onClick={() => viewProductDetails(1)}>
                <AiOutlineFullscreen />
              </Button>
              <Button className="b1">
                <CiHeart />
              </Button>
            </div>
          </div>
          <div className="info">
            <h4>All Natural Italian-Style Chicken Meatballs</h4>
            <span className="text-success d-block">In Stock</span>
            <Rating
              className="mt-2 mb-2"
              name="read-only"
              value={5}
              readOnly
              size="small"
              precision={0.5}
            />
            <div className="d-flex">
              <span className="oldPrice">$20.00</span>
              <span className="netPrice text-danger ml-2">$10.00</span>
            </div>
          </div>
        </div>

      {isOpenProductModal && (
        <ProductModal closeProductModal={() => setisProductModal(false)} />
      )}
    </>
  );
};

export default ProductItem;
