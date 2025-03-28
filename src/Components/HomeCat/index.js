import React from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import cat9 from "../../assets/images/cat9.png";
import { useState } from "react";

const HomeCat = () => {
  const [itemBg] = useState([
    "#fffceb",
    "#ecffec",
    "#feefea",
    "#fff3eb",
    "#fff3ff",
    "#f2fce4",
    "#feefea",
    "#fffceb",
    "#feefea",
    "#ecffec",
    "#feefea",
  ]);

  return (
    <section className="homeCat mt-5">
      <div className="container">
        <h3 className="mb-4 hd">Featured Categories</h3>
        <Swiper
          slidesPerView={7}
          spaceBetween={8}
          slidesPerGroup={1}
          pagination={{ clickable: true }}
          navigation={true}
          breakpoints={{
            // When window width is >= 320px (mobile)
            320: {
              slidesPerView: 4,
              spaceBetween: 10,
            },
            // When window width is >= 768px (tablet)
            768: {
              slidesPerView: 6,
              spaceBetween: 15,
            },
            // When window width is >= 1024px (desktop)
            1024: {
              slidesPerView: 7,
              spaceBetween: 8,
            },
          }}
          modules={[Navigation]}
          className="mySwiper"
        >
          {itemBg?.map((item, index) => (
            <SwiperSlide key={index}>
              <div
                className="item text-center cursor"
                style={{ background: item }}
              >
                <img src={cat9} alt="Category" />
                <h6>Red Aplle</h6>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Add custom CSS for smaller navigation arrows */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          width: 30px;
          height: 30px;
          background-color: #fff;
          border-radius: 50%;
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 16px;
          color: #333;
        }

        .swiper-button-next {
          right: 10px;
        }

        .swiper-button-prev {
          left: 10px;
        }
      `}</style>
    </section>
  );
};

export default HomeCat;
