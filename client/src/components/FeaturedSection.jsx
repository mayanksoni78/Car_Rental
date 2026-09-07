import React from 'react';
import Title from './Title';
import CarCards from './CarCards.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const FeaturedSection = () => {
  const { cars, navigate } = useAppContext();

  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">
            Top Choices
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-3">
            Featured Vehicles
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Explore our most popular rental options vetted for safety, comfort, and performance.
          </p>
        </div>

        {/* Cars Grid */}
        {cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.slice(0, 6).map((car) => (
              <div 
                key={car._id} 
                className="w-full transition-all duration-300 hover:-translate-y-1.5"
              >
                <CarCards car={car} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-slate-500 font-medium">No cars currently available. Please check back soon!</p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-14">
          <button 
            onClick={() => navigate("/cars")} 
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide"
          >
            Browse All Cars →
          </button>
        </div>
        
      </div>
    </section>
  );
};

export default FeaturedSection;