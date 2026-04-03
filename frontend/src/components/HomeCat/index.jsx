import { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const HomeCat = () => {
  const [categories, setCategories] = useState([]);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8081/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.log(err));
  }, []);

  return (
    <section className="homeCat">
      <div className="container">
        <div className="catHeader">
          <h4>FEATURED CATEGORIES</h4>
          <div className="catNav">
            <button ref={prevRef} className="navBtn">‹</button>
            <button ref={nextRef} className="navBtn">›</button>
          </div>
        </div>
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            setTimeout(() => {
              if (swiper.params?.navigation) {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.destroy();
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }, 100);
          }}
          modules={[Navigation]}
          spaceBetween={15}
          slidesPerView={6}
          breakpoints={{
            0: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 5 },
            1024: { slidesPerView: 6 }
          }}
        >
          {categories.map((cat, i) => (
            <SwiperSlide key={i}>
              <div className="catCard" style={{ background: cat.bg || "#f0fdf4" }}>
                <img src={cat.img} alt={cat.name} />
                <h6>{cat.name}</h6>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default HomeCat;