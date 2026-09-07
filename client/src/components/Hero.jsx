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
    <div className="relative bg-slate-950 min-h-[82vh] flex items-center justify-center overflow-hidden py-16 sm:py-24">
      {/* Background Image & Theme Ambient Lighting */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop" 
          alt="Premium Fleet" 
          className="w-full h-full object-cover object-center opacity-35"
        />
        {/* Deep Slate + Teal Mood Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950"></div>
        {/* Soft Teal Ambient Glow for seamless theme matching */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-teal-500/15 rounded-full blur-[130px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 max-w-4xl">
          Find Your Perfect Ride. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">
            Anywhere, Anytime.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-slate-300 font-normal max-w-2xl mb-10 leading-relaxed">
          Premium car rentals with instant booking, flexible duration, and zero hidden fees. Pick up and hit the open road.
        </p>

        {/* Search Widget */}
        <div className="w-full max-w-4xl bg-white/10 backdrop-blur-xl p-3 rounded-2xl sm:rounded-full border border-white/20 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-white rounded-xl sm:rounded-full p-2 sm:p-3 gap-3 w-full items-center">
            
            {/* Location */}
            <div className="w-full sm:flex-1 px-4 py-2 text-left border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="block text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">Location</label>
              <select 
                required 
                value={pickupLocation} 
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-sm sm:text-base"
              >  
                <option value="" disabled>Select city</option>
                {cityList.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Pick-up Date */}
            <div className="w-full sm:flex-1 px-4 py-2 text-left border-b sm:border-b-0 sm:border-r border-slate-100">
              <label className="block text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">Pick-up Date</label>
              <input 
                value={pickupDate} 
                onChange={e => setPickupDate(e.target.value)} 
                type='date' 
                min={new Date().toISOString().split('T')[0]} 
                required 
                className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-sm sm:text-base"
              />
            </div>

            {/* Return Date */}
            <div className="w-full sm:flex-1 px-4 py-2 text-left">
              <label className="block text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">Return Date</label>
              <input 
                value={returnDate} 
                onChange={e => setReturnDate(e.target.value)} 
                type="date" 
                min={pickupDate || new Date().toISOString().split('T')[0]} 
                required
                className="w-full bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer text-sm sm:text-base"
              />
            </div>
            
            {/* Search Button */}
            <button 
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl sm:rounded-full transition-all duration-200 shadow-md shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base whitespace-nowrap"
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