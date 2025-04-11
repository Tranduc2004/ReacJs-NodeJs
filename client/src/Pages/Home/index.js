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
import { useState, useEffect } from "react";
import { getProducts } from "../../services/api";
import { Link } from "react-router-dom";
import ProductItem from "../../Components/ProductItem";
import Chatbot from "../../Components/Chatbot";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        console.log("Dữ liệu sản phẩm:", data);

        // Kiểm tra data có phải là mảng không
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error("Dữ liệu không phải là mảng:", data);
          setProducts([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Kiểm tra products có phải là mảng không
  if (!Array.isArray(products)) {
    console.error("products không phải là mảng:", products);
    return <div>Không có sản phẩm nào</div>;
  }

  // Lấy 8 sản phẩm đầu tiên để hiển thị
  const bestSellers = products.slice(0, 8);
  const featuredProducts = products.slice(8, 13);

  return (
    <div className="home">
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
                  <h3 className="mb-0 hd">SẢN PHẨM NỔI BẬT</h3>
                  <p className="text-light1 text-sml mb-0">
                    Khám phá các sản phẩm bán chạy nhất của chúng tôi.
                  </p>
                </div>

                <Link to="/cat/1" className="ml-auto">
                  <Button className="viewAllBtn ml-auto">
                    View All&nbsp;
                    <FaArrowRight className="arrow" />
                  </Button>
                </Link>
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
                  {bestSellers.length > 0 ? (
                    bestSellers.map((product) => (
                      <SwiperSlide key={product._id}>
                        <ProductItem product={product} />
                      </SwiperSlide>
                    ))
                  ) : (
                    <div className="text-center">Không có sản phẩm nào</div>
                  )}
                </Swiper>
              </div>

              <div className="d-flex align-items-center mt-3">
                <div className="info w-75">
                  <h3 className="mb-0 hd">SẢN PHẨM MỚI</h3>
                  <p className="text-light1 text-sml mb-0">
                    Khám phá các sản phẩm mới nhất của chúng tôi.
                  </p>
                </div>

                <Button className="viewAllBtn ml-auto">
                  Xem tất cả <FaArrowRight className="arrow" />
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
                  {featuredProducts.length > 0 ? (
                    featuredProducts.map((product) => (
                      <SwiperSlide key={product._id}>
                        <ProductItem product={product} />
                      </SwiperSlide>
                    ))
                  ) : (
                    <div className="text-center">Không có sản phẩm nào</div>
                  )}
                </Swiper>
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
      <Chatbot />
    </div>
  );
};

export default BestSellers;
