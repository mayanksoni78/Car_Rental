import React from 'react';
import { useNavigate } from 'react-router-dom';

const CarCards = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY || '₹';
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => {
        navigate(`/car-details/${car._id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} 
      className="group bg-[#FAF7F0] rounded-2xl sm:rounded-3xl border border-[#E4D9C7] hover:border-[#3D4C27] hover:shadow-xl hover:shadow-[#3D4C27]/10 transition-all duration-300 flex flex-col overflow-hidden h-full w-full max-w-sm sm:max-w-none mx-auto cursor-pointer select-none"
    >
      {/* Image Showcase Container */}
      <div className="relative w-full h-36 sm:h-44 bg-gradient-to-b from-[#F5F0E7] to-[#EAE3D2]/50 flex items-center justify-center p-3 sm:p-4 border-b border-[#E4D9C7] overflow-hidden">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className="max-w-full max-h-full object-contain group-hover:scale-108 transition-transform duration-300 ease-out drop-shadow-md"
        />
        
        {/* Availability Badge */}
        {car.isAvailable ? (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-800 font-extrabold bg-emerald-100/90 border border-emerald-300/80 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Available
          </span>
        ) : (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 text-[9px] sm:text-[10px] uppercase tracking-wider text-rose-800 font-extrabold bg-rose-100/90 border border-rose-300/80 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs">
            Reserved
          </span>
        )}
        
        {/* Category Badge */}
        <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 text-[9px] sm:text-[10px] uppercase tracking-wider text-[#3D4C27] font-extrabold bg-[#EBF0E4]/90 border border-[#3D4C27]/30 px-2 sm:px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs">
          {car.category || 'Standard'}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-grow justify-between bg-[#FAF7F0]">
        <div>
          {/* Brand, Model & Year */}
          <div className="flex items-baseline justify-between gap-1.5 sm:gap-2 mb-1">
            <h3 className="text-sm sm:text-base font-black text-[#05091B] tracking-tight group-hover:text-[#3D4C27] transition-colors truncate">
              {car.brand} {car.model}
            </h3>
            <span className="text-[10px] sm:text-xs font-extrabold text-[#3D4C27] bg-[#EBF0E4] px-1.5 sm:px-2 py-0.5 rounded-md border border-[#3D4C27]/20 flex-shrink-0">
              {car.year || '2024'}
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-stone-500 font-medium mb-3 sm:mb-4 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{car.location || 'All Hubs'}</span>
          </p>

          {/* Colorized Specs Grid */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3.5 sm:mb-5">
            {/* Seating */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F0E7] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#E4D9C7] group-hover:border-[#3D4C27]/30 transition-colors">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#05091B] truncate">{car.seating_capacity} Seats</span>
            </div>

            {/* Fuel Type */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F0E7] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#E4D9C7] group-hover:border-[#3D4C27]/30 transition-colors">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#05091B] truncate">{car.fuel_type}</span>
            </div>

            {/* Transmission */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F0E7] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#E4D9C7] group-hover:border-[#3D4C27]/30 transition-colors">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#05091B] truncate">{car.transmission}</span>
            </div>

            {/* Hub / Location */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-[#F5F0E7] px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#E4D9C7] group-hover:border-[#3D4C27]/30 transition-colors">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-[#05091B] truncate">{car.location}</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 sm:pt-3.5 border-t border-[#E4D9C7] flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs text-stone-500 font-semibold block -mb-0.5">Daily rate</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-base sm:text-xl font-black text-[#3D4C27] tracking-tight">{currency}{car.pricePerDay}</span>
              <span className="text-[10px] sm:text-xs text-stone-500 font-bold truncate"> / day</span>
            </div>
          </div>
          
          <button className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#05091B] group-hover:bg-[#3D4C27] text-[#FAF7F0] font-black text-xs tracking-wide transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-[#05091B]/10 group-hover:shadow-[#3D4C27]/30 group-hover:scale-105 active:scale-95 cursor-pointer flex-shrink-0">
            <span>Book</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCards;