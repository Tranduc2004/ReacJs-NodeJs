import InnerImageZoom from "react-inner-image-zoom";
import { Swiper, SwiperSlide } from "swiper/react";
import React, { useState } from "react";

const ProductZoom = () => {
  const images = [
    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image-62.jpg",
    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image2-47.jpg",
    "https://klbtheme.com/bacola/wp-content/uploads/2021/04/product-image3-35.jpg",
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const handleImageChange = (index) => {
    setIsFading(true); // Bắt đầu hiệu ứng fade-out
    setTimeout(() => {
      setActiveIndex(index); // Cập nhật ảnh lớn sau khi fade-out
      setIsFading(false); // Kích hoạt fade-in
    }, 300); // Thời gian fade-out
  };
  return (
    <>
      {/* Large Image with Zoom */}
      <div className="productZoom position-relative">
        <div className="badge badge-primary">23%</div>
        <div className={`fade-image ${isFading ? "fade-out" : "fade-in"}`}>
          <InnerImageZoom
            src={images[activeIndex]}
            zoomType="hover"
            zoomScale={1}
          />
        </div>
      </div>

      {/* Thumbnail Swiper */}
      <Swiper spaceBetween={10} slidesPerView={3} className="zoomSlider">
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <div className={`item ${activeIndex === index ? "active" : ""}`}>
              <img
                alt=""
                src={src}
                className="w-100 thumbnail"
                onClick={() => handleImageChange(index)}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
export default ProductZoom;
