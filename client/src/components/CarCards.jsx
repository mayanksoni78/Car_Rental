import React from 'react'
import { useNavigate } from 'react-router-dom';

const CarCards = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => {
        navigate(`/car-details/${car._id}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} 
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full max-w-sm mx-auto cursor-pointer select-none"
    >
      <div className="relative w-full h-36 bg-gray-50 flex items-center justify-center p-3">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        
        {car.isAvailable && (
          <span className="absolute top-2.5 left-2.5 text-[10px] uppercase tracking-wider text-white font-bold bg-gradient-to-r from-teal-600 to-teal-700 px-2 py-0.5 rounded-md shadow-sm">
            Available Now
          </span>
        )}
        
        <span className="absolute top-2.5 right-2.5 text-[10px] uppercase tracking-wider text-white font-extrabold bg-teal-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-md shadow-sm border border-teal-800/30">
          {car.year}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 leading-snug tracking-tight group-hover:text-teal-700 transition-colors truncate">
              {car.brand} {car.model}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">{car.number}</p>
          </div>
          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 bg-teal-50 text-teal-800 rounded md flex-shrink-0 self-start">
            {car.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 my-3 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 bg-gray-50/80 p-2 rounded-xl border border-gray-100/50">
            <i className="fa-solid fa-user-group text-teal-700 w-4 text-center text-xs"></i>
            <span className="font-medium truncate text-[11px]">{car.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50/80 p-2 rounded-xl border border-gray-100/50">
            <i className="fa-solid fa-gas-pump text-teal-700 w-4 text-center text-xs"></i>
            <span className="font-medium truncate text-[11px]">{car.fuel_type}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50/80 p-2 rounded-xl border border-gray-100/50">
            <i className="fa-solid fa-car-side text-teal-700 w-4 text-center text-xs"></i>
            <span className="font-medium truncate text-[11px]">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50/80 p-2 rounded-xl border border-gray-100/50">
            <i className="fa-solid fa-location-dot text-teal-700 w-4 text-center text-xs"></i>
            <span className="font-medium truncate text-[11px]">{car.location}</span>
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-teal-950 tracking-tight">{currency}{car.pricePerDay}</span>
            <span className="text-[11px] text-gray-400 font-medium"> / day</span>
          </div>
          
          <div className="h-8 w-8 rounded-lg bg-gray-50 group-hover:bg-teal-700 flex items-center justify-center text-teal-700 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-teal-900/10">
            <i className="fa-solid fa-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5"></i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CarCards