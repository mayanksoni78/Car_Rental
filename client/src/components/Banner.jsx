import React from 'react'
import { useNavigate } from 'react-router-dom'


const Banner = () => {
  const navigate=useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-start items-center justify-between px-5 sm:px-7 md:px-10 md:pl-14 pt-8 sm:pt-10 bg-linear-to-r from-[#0a5d61] to-[#92dee2] max-w-7xl mx-3 sm:mx-4 md:mx-auto rounded-2xl overflow-hidden">

      <div className="text-white max-w-xl text-center md:text-left">
        <h2 className="text-xl sm:text-xl md:text-2xl font-medium">Do You Own a Car?</h2>
         <p className="mt-2 text-[#fff7d7] text-sm sm:text-sm md:text-base leading-relaxed">
         Monetize your vehicle effortlessly by listing it on CarRental.
         We take care of insurance, driver verification and secure payments —
         so you can earn passive income, stress-free.</p>

        <button onClick={()=>(navigate("/my-booking"))}className="mt-4 mb-4 w-full sm:w-auto px-5 py-2 bg-[#f6f9e3] text-[#2c5855] font-semibold rounded-3xl hover:bg-[#e7dbab] transition-all duration-300"> List Your Car</button>
      </div >
      <div className="mt-6 mb-6 md:mt-0 flex justify-center md:justify-end w-full md:w-auto">
        <img src="https://www.freeiconspng.com/uploads/audi-car-png-image-side-view-7.png" alt="Image" className="-56 sm:w-64 md:w-80 lg:w-[420px] bject-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
        />
      </div>
      
    </div>
  )
}

export default Banner