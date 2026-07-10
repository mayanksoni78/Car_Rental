import React from 'react'
import Title from './Title'
import CarCards from './CarCards.jsx'
import { useAppContext } from '../context/AppContext.jsx'

const FeaturedSection = () => {
  const { cars, navigate } = useAppContext();

  return (
    <section className="bg-[#efeedd] py-10 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="text-center mb-10 sm:mb-14">
          <Title title="Featured Vehicles" subTitle="Explore our premium selection of cars" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {cars && cars.slice(0, 6).map((car) => (
            <div 
              key={car._id} 
              className="w-full transition-transform duration-300 hover:-translate-y-2 backface-hidden"
            >
              <CarCards car={car} />
            </div>
          ))}
        </div> 

        <div className="flex justify-center mt-12 sm:mt-16">
          <button 
            onClick={() => navigate("/cars")} 
            className="bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-full hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base tracking-wide outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Explore all Cars
          </button>
        </div>
        
      </div>
    </section>
  )
}

export default FeaturedSection