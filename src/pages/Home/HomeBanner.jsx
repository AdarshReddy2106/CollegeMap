import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const bannerSlides = [
  {
    id: 1,
    image: '/banner.png',
    alt: 'CollegeMap - Your JEE Preparation Platform',
    link: '/Questionaire',
  },
  {
    id: 2,
    image: '/banner_2.png',
    alt: 'CollegeMap - JEE Mock Tests & Resources',
    link: '/resources',
  },
];

const NextArrow = ({ onClick }) => (
  <button className="slider-arrow slider-next" onClick={onClick} aria-label="Next slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button className="slider-arrow slider-prev" onClick={onClick} aria-label="Previous slide">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
);

const HomeBanner = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    fade: true,
    cssEase: 'ease-in-out',
    dotsClass: 'slick-dots banner-dots',
  };

  return (
    <section className="home-banner">
      <Slider {...settings}>
        {bannerSlides.map((slide) => (
          <div key={slide.id} className="banner-slide">
            <a href={slide.link} className="banner-slide-link">
              <img
                src={slide.image}
                alt={slide.alt}
                className="banner-image"
                loading={slide.id === 1 ? 'eager' : 'lazy'}
              />
            </a>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default HomeBanner;


