import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BooksCarousel = ({ books, onBookClick }) => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={16}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 10,
          },
          480: {
            slidesPerView: 2,
            spaceBetween: 12,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 14,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
        }}
        className="w-full"
      >
        {books.map((book, idx) => (
          <SwiperSlide key={idx}>
            <div 
              className="bg-[#F9D3CF] rounded-lg overflow-hidden shadow-lg cursor-pointer"
              onClick={() => onBookClick(idx)}
            >
              <div className="h-[350px] overflow-hidden">
                <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-center">
                <h3 className="text-lg font-medium">{book.title}</h3>
                <p className="italic text-gray-600 text-sm">{book.subtitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default BooksCarousel;
