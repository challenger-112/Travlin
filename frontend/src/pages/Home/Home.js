import React from 'react';
import ImageSlider from '../../components/ImageSlider/ImageSlider';
import Navbar from '../../components/Navbar/Navbar';
import PopularPlaces from '../../components/PopularPlaces/PopularPlaces';
import TourTypes from '../../components/TourTypes/TourTypes';
import About from '../../components/About/About';
import Footer from '../../components/Footer/Footer';

function Home() {
  return (
    <>
      <ImageSlider />
      <Navbar />
      <PopularPlaces />
      <TourTypes />
      <About />
      <Footer />
    </>
  );
}

export default Home;