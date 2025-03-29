import React from "react";
import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";
import Slider from "react-slick";
import { useRef } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.css";

const ProductModal = (props) => {
  var settings2 = {
    dots: false,
    infinite: false,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: false,
    arrows: false,
  };
  var settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    fade: false,
    arrows: true,
  };

  const zoomSliderBig = useRef();
  const zoomSlider = useRef();

  const goto = (index) => {
    zoomSlider.current.slickGoTo(index);
    zoomSliderBig.current.slickGoTo(index);
  };

  return (
    <Dialog
      open={true}
      className="productModal"
      onClose={() => props.closeProductModal}
      sx={{
        "& .MuiDialog-paper": {
          width: "100%",
          maxWidth: "800px",
          padding: "20px",
          position: "relative",
        },
      }}
    >
      <Button
        onClick={() => props.closeProductModal()}
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
      <h4 className="mb-1 font-weight-bold">
        All Natural Italian-Style Chicken Meatballs
      </h4>
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center mr-4">
          <span className="mr-2">Brands:</span>
          <span>
            <b>Welch's</b>
          </span>
        </div>
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
          <div className="productZoom">
            <Slider
              {...settings2}
              className="zoomSliderBig"
              ref={zoomSliderBig}
            >
              <div className="item">
                <InnerImageZoom
                  zoomType="hover"
                  zoomScale={1}
                  src={
                    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62.jpg"
                  }
                />
              </div>
              <div className="item">
                <InnerImageZoom
                  zoomType="hover"
                  zoomScale={1}
                  src={
                    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image2-47.jpg"
                  }
                />
              </div>
              <div className="item">
                <InnerImageZoom
                  zoomType="hover"
                  zoomScale={1}
                  src={
                    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image3-35.jpg"
                  }
                />
              </div>
            </Slider>
          </div>
          <Slider {...settings} className="zoomSlider" ref={zoomSlider}>
            <div className="item">
              <img
                alt=""
                src={
                  "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62.jpg"
                }
                className="w-100"
                onClick={() => goto(0)}
              />
            </div>
            <div className="item">
              <img
                alt=""
                src={
                  "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image2-47.jpg"
                }
                className="w-100"
                onClick={() => goto(1)}
              />
            </div>
            <div className="item">
              <img
                alt=""
                src={
                  "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image3-35.jpg"
                }
                className="w-100"
                onClick={() => goto(2)}
              />
            </div>
          </Slider>
        </div>
        <div className="col-md-7">
          <div className="d-flex align-items-center">
            <span className="oldPrice lg mr-2">$20.00</span>
            <span className="netPrice text-danger lg">$10.00</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ProductModal;
