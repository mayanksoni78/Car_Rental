import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Hero = () => {
  const [pickupLocation, setPickupLocation] = useState('');
  const { pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!pickupLocation || !pickupDate || !returnDate) return;
    navigate(`/cars?pickupLocation=${pickupLocation}&pickupDate=${pickupDate}&returnDate=${returnDate}`);
  };

  const cityList = ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Ahmedabad", "Hyderabad", "Pune"];

  return (
    <div className="relative bg-teal-950 min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image / Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" 
          alt="Premium Car" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/60 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 flex flex-col items-center">
        
        <div className="text-center mb-10 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
            Find Your Perfect Drive
          </h1>
          <p className="text-lg sm:text-xl text-teal-100 font-medium">
            Explore our premium selection of vehicles for your next adventure. Easy booking, flexible rates.
          </p>
        </div>

        {/* Search Widget */}
        <div className="w-full max-w-5xl bg-white/10 backdrop-blur-md p-2 rounded-2xl sm:rounded-full border border-white/20 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-xl sm:rounded-full p-2 gap-2 w-full">
            
            <div className="flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Pick-up Location</label>
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-gray-400"></i>
                <select 
                  required 
                  value={pickupLocation} 
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer text-sm sm:text-base appearance-none"
                >  
                  <option value="" disabled className="text-gray-400">Select city</option>
                  {cityList.map(city => <option key={city} value={city} className="text-black">{city}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 px-4 py-2 border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Pick-up Date</label>
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-calendar text-gray-400"></i>
                <input 
                  value={pickupDate} 
                  onChange={e => setPickupDate(e.target.value)} 
                  type='date' 
                  min={new Date().toISOString().split('T')[0]} 
                  required 
                  className="w-full bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="flex-1 px-4 py-2 flex flex-col justify-center">
              <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Return Date</label>
              <div className="flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-gray-400"></i>
                <input 
                  value={returnDate} 
                  onChange={e => setReturnDate(e.target.value)} 
                  type="date" 
                  min={pickupDate || new Date().toISOString().split('T')[0]} 
                  required
                  className="w-full bg-transparent text-gray-800 font-bold focus:outline-none cursor-pointer text-sm sm:text-base"
                />
              </div>
            </div>
            
            <button 
              type="submit"
              className="sm:ml-2 bg-teal-600 text-white font-bold px-8 py-4 rounded-xl sm:rounded-full hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/30 w-full sm:w-auto"
            >
              Search Cars
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Hero;