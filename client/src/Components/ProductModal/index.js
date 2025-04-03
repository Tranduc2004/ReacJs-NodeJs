import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import { IoIosHeartEmpty } from "react-icons/io";
import { MdOutlineCompareArrows } from "react-icons/md";
import "swiper/css";

import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";
import QuantityBox from "../QuantityBox";
import ProductZoom from "../ProductZoom";

const ProductModal = ({ closeProductModal }) => {
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
      <h4 className="mb-1 font-weight-bold">
        All Natural Italian-Style Chicken Meatballs
      </h4>
      <div className="d-flex align-items-center">
        <span className="mr-2">
          Brands: <b>Welch's</b>
        </span>
        <Rating
          name="read-only"
          value={5}
          size="small"
          precision={0.5}
          readOnly
        />
      </div>
      <hr />

      <div className="row mt-2">
        <div className="col-md-5">
          <ProductZoom />
        </div>

        {/* Product Info */}
        <div className="col-md-7">
          <div className="d-flex align-items-center mb-3">
            <span className="oldPrice lg mr-2">$20.00</span>
            <span className="netPrice text-danger lg">$10.00</span>
          </div>
          <span className="badge bg-success"> IN STOCK</span>
          <p className="mt-3">
            Vivamus adipiscing nisl ut dolor dignissim semper. Nulla luctus
            malesuada tincidunt.
          </p>

          {/* Quantity & Add to Cart */}
          <div className="d-flex align-items-center">
            <QuantityBox />
            <Button
              className="btn-lg btn-big btn-round ml-3"
              sx={{
                backgroundColor: "#00aaff",
                color: "white",
                "&:hover": {
                  backgroundColor: "#0088cc",
                },
              }}
            >
              {" "}
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
