import ProductItem from "../../../Components/ProductItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import React from "react";

const RelatedProducts = (props) => {
  return (
    <>
      <div className="d-flex align-items-center mt-3">
        <div className="info w-75">
          <h3 className="mb-0 hd">{props.title}</h3>
        </div>
      </div>
      <div className="product_row w-100 mt-2">
        <Swiper
          slidesPerView={5}
          spaceBetween={0}
          slidesPerGroup={1}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Navigation]}
          className="mySwiper"
          breakpoints={{
            // Mobile (default): 2 sản phẩm
            0: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            // Tablet: 3 sản phẩm
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            // Desktop: 4 sản phẩm
            1024: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
          }}
        >
          <SwiperSlide>
            <ProductItem />
          </SwiperSlide>
          <SwiperSlide>
            <ProductItem />
          </SwiperSlide>
          <SwiperSlide>
            <ProductItem />
          </SwiperSlide>
          <SwiperSlide>
            <ProductItem />
          </SwiperSlide>
          <SwiperSlide>
            <ProductItem />
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
};
export default RelatedProducts;
