
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const banners = [
  {
    title: "Fresh Fruits & Vegetables",
    subtitle: "Freshness delivered to your doorstep",
    background: "linear-gradient(120deg, #d9f99d, #65a30d)"
  },
  {
    title: "Daily Grocery Essentials",
    subtitle: "Everything you need, in one place",
    background: "linear-gradient(120deg, #fde68a, #ea580c)"
  },
  {
    title: "Fresh Dairy Products",
    subtitle: "Quality products for your family",
    background: "linear-gradient(120deg, #bfdbfe, #2563eb)"
  },
  {
    title: "Shop More, Save More",
    subtitle: "Discover great grocery deals",
    background: "linear-gradient(120deg, #fbcfe8, #be185d)"
  }
];

const HomeBanner = () => {
  return (
    <div className="container mt-3">
      <div className="HomeBannerSection">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 3000 }}
          loop
          spaceBetween={15}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={index}>
              <div
                style={{
                  background: banner.background,
                  minHeight: "280px",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "30px",
                  color: "#ffffff"
                }}
              >
                <h2>{banner.title}</h2>
                <p>{banner.subtitle}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HomeBanner;
