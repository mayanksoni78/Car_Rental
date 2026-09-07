import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedSection from '../components/FeaturedSection';
import Banner from '../components/Banner';
import Testimonial from '../components/Testimonial';

const Home = () => {
  return (
    <div className="bg-[#F5F0E7]">
      <Hero />
      <HowItWorks />
      <FeaturedSection />
      <Banner />
      <Testimonial />
    </div>
  );
};

export default Home;