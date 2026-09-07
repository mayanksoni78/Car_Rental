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
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col overflow-hidden h-full max-w-sm mx-auto cursor-pointer select-none"
    >
      {/* Image Container */}
      <div className="relative w-full h-44 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-50 flex items-center justify-center p-4 border-b border-slate-100">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-sm"
        />
        
        {/* Availability Badge */}
        {car.isAvailable && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider text-teal-900 font-bold bg-teal-100/90 border border-teal-300/60 px-2.5 py-1 rounded-lg backdrop-blur-md">
            Available Now
          </span>
        )}
        
        {/* Category Badge */}
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-slate-700 font-bold bg-white/90 border border-slate-200 px-2.5 py-1 rounded-lg shadow-2xs">
          {car.category || 'Premium'}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight group-hover:text-teal-600 transition-colors truncate">
              {car.brand} {car.model}
            </h3>
            <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
              {car.year || '2024'}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-4">{car.number || 'Verified Vehicle'}</p>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {/* Seating */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-semibold text-slate-700 truncate">{car.seating_capacity} Seats</span>
            </div>

            {/* Fuel Type */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-semibold text-slate-700 truncate">{car.fuel_type}</span>
            </div>

            {/* Transmission */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-xs font-semibold text-slate-700 truncate">{car.transmission}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold text-slate-700 truncate">{car.location}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">{currency}{car.pricePerDay}</span>
            <span className="text-xs text-slate-400 font-medium"> / day</span>
          </div>
          
          <button className="px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-teal-600 text-white font-semibold text-xs tracking-wide transition-all duration-200 shadow-sm flex items-center gap-1.5">
            Book Now
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