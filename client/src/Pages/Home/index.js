import HomeBanner from "../../Components/HomeBanner";
import HomeCat from "../../Components/HomeCat";
import banner1 from "../../assets/images/banner1.webp";
import banner2 from "../../assets/images/banner2.png";
import banner3 from "../../assets/images/banner3.png";
import banner4 from "../../assets/images/banner4.png";
import coupon from "../../assets/images/coupon.webp";
import Button from "@mui/material/Button";
import { FaArrowRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import * as React from "react";
import { CiMail } from "react-icons/ci";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import ProductItem from "../../Components/ProductItem";

const BestSellers = () => {
  return (
    <>
      <HomeBanner />
      <HomeCat />
      <section className="homeProducts">
        <div className="container">
          <div className="row">
            <div className="col-md-3 hidden md:block">
              <div className="sticky">
                <div className="banner">
                  <img alt="" src={banner1} className="cusror w-100" />
                </div>
                <div className="banner mt-3">
                  <img alt="" src={banner2} className="cusror w-100" />
                </div>
              </div>
            </div>
            <div className="col-md-9 productRow">
              <div className="d-flex align-items-center">
                <div className="info w-75">
                  <h3 className="mb-0 hd">BEST SELLER</h3>
                  <p className="text-light1 text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <Button className="viewAllBtn ml-auto">
                  View All <FaArrowRight className="arrow" />
                </Button>
              </div>
              <div className="product_row w-100 mt-2">
                <Swiper
                  slidesPerView={4}
                  spaceBetween={8}
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
              {/* Repeat the same Swiper configuration for the second section */}
              <div className="d-flex align-items-center mt-3">
                <div className="info w-75">
                  <h3 className="mb-0 hd">BEST SELLER</h3>
                  <p className="text-light1 text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>

                <Button className="viewAllBtn ml-auto">
                  View All <FaArrowRight className="arrow" />
                </Button>
              </div>
              <div className="product_row productRow2 w-100 mt-4 d-flex">
                <ProductItem />
                <ProductItem />
                <ProductItem />
                <ProductItem />
                <ProductItem />
              </div>

              <div className="d-flex mt-4 mb-5 bannerSec">
                <div className="banner">
                  <img src={banner3} alt="" className="cursor w-100" />
                </div>
                <div className="banner">
                  <img src={banner4} alt="" className="cursor w-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="newsLetterSection mt-3 d-flex align-items-center">
        <div className="container">
          <div className="row">
            <div className="col-md-6 row1">
              <p className="text-white mb-1">
                $20 discount for your first order
              </p>
              <h3 className="text-white">Join our newsletter and get...</h3>
              <p className="text-light1">
                Join our email subscription now to get updates on
                <br /> promotion and coupons.
              </p>

              <form>
                <CiMail />
                <input type="text" placeholder="Nhập email của bạn" />
                <Button>Đăng kí</Button>
              </form>
            </div>
            <div className="col-md-6">
              <img alt="" src={coupon} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BestSellers;
