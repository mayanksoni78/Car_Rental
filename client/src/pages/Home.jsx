import React from 'react'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import FeaturedSection from '../components/FeaturedSection'
import NewsLetter from '../components/NewsLetter'

const Home = () => {
  return (
    <div className="bg-gray-50">
      <Hero/>
      <HowItWorks/>
      <FeaturedSection/>
      <Banner/>
      <Testimonial/>
    </div>
  )
}

export default Home