import React from 'react';
import CarCards from './CarCards.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const FeaturedSection = () => {
  const { cars, navigate } = useAppContext();

  return (
    <section className="bg-[#F5F0E7] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#05091B] tracking-tight mb-1.5">
            Available Cars
          </h2>
          <p className="text-[#64748B] text-xs sm:text-sm">
            Clean, maintained vehicles ready for departure.
          </p>
        </div>

        {/* Cars Grid */}
        {cars && cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.slice(0, 6).map((car) => (
              <div 
                key={car._id} 
                className="w-full transition-all duration-200 hover:-translate-y-1"
              >
                <CarCards car={car} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FAF7F0] rounded-2xl border border-[#E4D9C7]">
            <p className="text-[#64748B] text-xs font-medium">No cars currently available.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <button 
            onClick={() => navigate("/cars")} 
            className="px-7 py-3 bg-[#05091B] hover:bg-[#10172B] text-white font-bold rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm tracking-wide cursor-pointer border border-[#10172B]"
          >
            View All Cars →
          </button>
        </div>
        
      </div>
    </section>
  );
};

export default FeaturedSection;