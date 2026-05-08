import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';

const CarCards = ({car}) => {
    const currency=import.meta.env.VITE_CURRENCY;
    const navigate =useNavigate();

  return (

 <div onClick={()=>{navigate(`/car-details/${car._id}`);scrollTo(0,0)}} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6 cursor-pointer w-full max-w-sm sm:max-w-md md:max-w-lg border border-gray-100 hover:border-teal-200 hover:-translate-y-1">

  <div className="flex items-start justify-between gap-2 sm:gap-3">
   <img src={car.image} alt="Car-Image" 
    className="w-24 h-16 sm:w-32 sm:h-22 object-cover rounded-xl shadow-sm "/>
    {car.isAvailable && (
        <p className="text-[10px] sm:text-xs text-white font-semibold bg-gradient-to-r from-teal-500 to-teal-600 px-3 py-1 rounded-full shadow-sm">Available Now</p>
      )}

   <div className="text-right">
      <span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-900">{currency}{car.pricePerDay}</span>
      <span className="text-xs sm:text-sm text-gray-500 font-normal"> / day</span>
    </div>
  </div>

   <div className="mt-4 sm:mt-5">
    <div>
     <div>
        <h3 className="text-base sm:text-xl font-bold text-gray-800 leading-tight">{car.brand} {car.model} 
          <span className="ml-2 text-xs sm:text-sm text-gray-500 font-normal">({car.number})</span>
        </h3>
       
        <p className="text-xs sm:text-sm text-teal-600 font-medium mt-1">{car.category} • {car.year}</p>
     </div>
   </div>

   <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 pt-4 border-t border-gray-100">
     <div className="flex items-center gap-2">
      <i className="fa-solid fa-user-group text-teal-600 text-sm sm:text-base"></i>
      <span className="font-medium">{car.seating_capacity} Seats</span>
    </div>

   <div className="flex items-center gap-2">
        <i className="fa-solid fa-gas-pump text-teal-600 text-sm sm:text-base"></i>
    <span className="font-medium">{car.fuel_type}</span>
   </div>
<div className="flex items-center gap-2">
        <i className="fa-solid fa-car-side text-teal-600 text-sm sm:text-base"></i>
    <span className="font-medium">{car.transmission}</span>
   </div>
   <div className="flex items-center gap-2">
        <i className="fa-solid fa-location-dot text-teal-600 text-sm sm:text-base"></i>
     <span className="font-medium">{car.location}</span>
   </div>
   
  </div>
 </div>
</div>
  )
}

export default CarCards