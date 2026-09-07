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
    <div className="relative bg-[#05091B] min-h-[72vh] flex items-center justify-center overflow-hidden py-14 sm:py-20">
      {/* Background Image & Ambient Glow */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2070&auto=format&fit=crop" 
          alt="Car" 
          className="w-full h-full object-cover object-center opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#05091B]/95 via-[#05091B]/80 to-[#05091B]"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[260px] bg-[#3D4C27]/25 rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        
        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4">
          Find Your Next <span className="text-[#8EA860]">Drive</span>
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 font-normal max-w-xl mb-8">
          Instant booking, verified cars, transparent pricing.
        </p>

        {/* Search Widget */}
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-md p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-[#FAF7F0] border border-[#E4D9C7] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 gap-2.5 w-full items-center">
            
            {/* Location */}
            <div className="w-full sm:flex-1 px-3.5 py-1.5 text-left border-b sm:border-b-0 sm:border-r border-[#E4D9C7]">
              <label className="block text-[10px] font-bold text-[#3D4C27] uppercase tracking-wider mb-0.5">Location</label>
              <select 
                required 
                value={pickupLocation} 
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full bg-transparent text-[#05091B] font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
              >  
                <option value="" disabled>Select city</option>
                {cityList.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>

            {/* Pick-up Date */}
            <div className="w-full sm:flex-1 px-3.5 py-1.5 text-left border-b sm:border-b-0 sm:border-r border-[#E4D9C7]">
              <label className="block text-[10px] font-bold text-[#3D4C27] uppercase tracking-wider mb-0.5">Pick-up Date</label>
              <input 
                value={pickupDate} 
                onChange={e => setPickupDate(e.target.value)} 
                type='date' 
                min={new Date().toISOString().split('T')[0]} 
                required 
                className="w-full bg-transparent text-[#05091B] font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
              />
            </div>

            {/* Return Date */}
            <div className="w-full sm:flex-1 px-3.5 py-1.5 text-left">
              <label className="block text-[10px] font-bold text-[#3D4C27] uppercase tracking-wider mb-0.5">Return Date</label>
              <input 
                value={returnDate} 
                onChange={e => setReturnDate(e.target.value)} 
                type="date" 
                min={pickupDate || new Date().toISOString().split('T')[0]} 
                required
                className="w-full bg-transparent text-[#05091B] font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
              />
            </div>
            
            {/* Search Button */}
            <button 
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black rounded-xl transition-all shadow-md shadow-[#3D4C27]/30 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Search Cars</span>
              <svg className="w-4 h-4 text-[#8EA860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Hero;