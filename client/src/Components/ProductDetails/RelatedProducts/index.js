import ProductItem from "../../ProductItem";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getSuggestedProducts } from "../../../services/api";

const RelatedProducts = React.memo(({ title, productId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevProductIdRef = useRef(null);

  const fetchSuggestedProducts = useCallback(async () => {
    if (!productId || productId === prevProductIdRef.current) {
      setLoading(false);
      return;
    }

    try {
      console.log(
        "[RelatedProducts] Bắt đầu gọi API với productId:",
        productId
      );
      const response = await getSuggestedProducts(productId);
      console.log("[RelatedProducts] Kết quả từ API:", response);

      if (response && Array.isArray(response)) {
        setProducts(response);
      }
    } catch (error) {
      console.error("[RelatedProducts] Lỗi khi lấy sản phẩm gợi ý:", error);
      setProducts([]);
    } finally {
      setLoading(false);
      prevProductIdRef.current = productId;
    }
  }, [productId]);

  useEffect(() => {
    fetchSuggestedProducts();
  }, [fetchSuggestedProducts]);

  if (loading) {
    return <div>Đang tải sản phẩm liên quan...</div>;
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      <div className="d-flex align-items-center mt-3">
        <div className="info w-75">
          <h3 className="mb-0 hd">{title}</h3>
        </div>
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
            0: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 8,
            },
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <ProductItem product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
});

RelatedProducts.displayName = "RelatedProducts";

export default RelatedProducts;
