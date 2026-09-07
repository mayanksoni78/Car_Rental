import React from 'react';
import Title from './Title';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-[#F5F0E7] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">
      <Title 
        title="About Us"
        subTitle="Welcome to CarRental App, your trusted partner for simple, reliable, and affordable car rentals. Our goal is to make getting a car easy, fast, and stress-free—whether you need it for daily travel, business trips, or special occasions.

At CarRental, we offer a wide range of well-maintained vehicles to suit every need and budget. From compact cars for city rides to comfortable SUVs for long journeys, we ensure every vehicle meets high safety and quality standards.

We believe renting a car should be hassle-free. That’s why our app is designed with a user-friendly interface, transparent pricing, and flexible booking options. With just a few taps, you can choose your car, set your schedule, and hit the road with confidence.

Customer satisfaction is at the heart of everything we do. Our support team is always ready to assist you, ensuring a smooth experience from booking to return.

Choose CarRental and enjoy freedom, comfort, and convenience—wherever the road takes you."
      />
    </div>
  );
};
export default AboutUs;