import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import banner1 from "../../assets/banner1.png";
import b1 from "../../assets/b1.jpg";
import banner3 from "../../assets/banner3.png";
import banner4 from "../../assets/banner4.png";

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
          <SwiperSlide><img src={banner1} alt="banner1" /></SwiperSlide>
          <SwiperSlide><img src={b1} alt="b1" /></SwiperSlide>
          <SwiperSlide><img src={banner3} alt="banner3" /></SwiperSlide>
          <SwiperSlide><img src={banner4} alt="banner4" /></SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
};

export default HomeBanner;