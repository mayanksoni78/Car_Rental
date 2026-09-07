import React from 'react';

const Banner = () => {
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-r from-[#05091B] via-[#0A1122] to-[#121C16] rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between overflow-hidden border border-[#3D4C27]/30 shadow-xl">
        
        {/* Elegant Subtle Radial Grading */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#3D4C27]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-[#10172B] to-[#3D4C27]/15 rounded-full blur-2xl pointer-events-none"></div>

        {/* Text Content */}
        <div className="text-white max-w-lg text-center lg:text-left z-10 mb-8 lg:mb-0 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-[#FAF7F0]">
            Ready to hit the road?
          </h2>
          
          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-md">
            Instant online reservations, fully insured luxury & economy vehicles, and 24/7 roadside assistance on every journey.
          </p>
        </div>

        {/* Vehicle Visual Showcase */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#3D4C27]/30 via-[#8EA860]/20 to-transparent blur-md opacity-60 group-hover:opacity-90 transition duration-500"></div>
            <img 
              src="https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=900&auto=format&fit=crop" 
              alt="Premium Vehicle" 
              className="relative w-full max-w-md rounded-2xl shadow-2xl object-cover border border-slate-700/60 aspect-16/10"
            />
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Banner;