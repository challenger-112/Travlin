import React, { useEffect, useState } from 'react';
import './ImageSlider.css';
import { FaUser } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

import logo from '../../assets/images/logo.png';
import image1 from '../../assets/images/1.jpg';
import image2 from '../../assets/images/2.jpeg';
import image3 from '../../assets/images/3.jpg';
import image4 from '../../assets/images/4.jpeg';
import image5 from '../../assets/images/5.jpg';

const images = [image1, image2, image3, image4, image5];

const ImageSlider = () => {
  const [current, setCurrent] = useState(0);
  const [isTablet, setIsTablet] = useState(() => (typeof window !== 'undefined' ? window.innerWidth > 768 && window.innerWidth <= 1024 : false));
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

  // ========== IMAGE SLIDER EFFECTS ==========
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const navigate = useNavigate();

  // ========== SCREEN SIZE EFFECTS ==========
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className={`slider-container`}>
        {/* Logo and Login Button */}
        <div className="top-right-logo">
          <img src={logo} alt="Logo" className="page-logo-img" />
          <span className="page-logo-text">Travलिन</span>
          {!isMobile && !isTablet && (
            <button className="login-button" onClick={() => navigate("/login")}>
              <FaUser style={{ marginRight: "6px" }} /> Login / Signup
            </button>
          )}
        </div>

        {/* Image Slide */}
        <img src={images[current]} alt={`slide-${current}`} className="slider-image" />

        {/* Search Overlay */}
        <div className="search-overlay">
          <div className="overlay-box">
            <h1>FIND THE PERFECT PLACE TO GO</h1>
            <h3>Get personalized recommendations from us</h3>
            <div className="search-wrapper">
              <input type="text" placeholder="Dream Place....." className="search-bar" />
              <button className="search-button">Start Planning</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImageSlider;
