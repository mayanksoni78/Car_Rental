import React from 'react';
import { useNavigate } from 'react-router-dom';

const Banner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between overflow-hidden shadow-xl border border-slate-800">
        
        {/* Soft Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Text Content */}
        <div className="text-white max-w-xl text-center lg:text-left z-10 mb-8 lg:mb-0">
          <span className="inline-block text-teal-400 font-bold text-xs uppercase tracking-widest bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-lg mb-4">
            Fast & Reliable
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4 text-white">
            Ready for your next journey?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
            Find the right car, choose your dates, and hit the road with confidence. Instant booking with zero paperwork delays.
          </p>
        </div>

        {/* Real Vehicle Visual */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end z-10">
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop" 
            alt="Premium Car Fleet" 
            className="w-full max-w-md rounded-2xl shadow-2xl object-cover border border-slate-700/60 hover:scale-[1.01] transition-transform duration-500"
          />
        </div>
        
      </div>
    </section>
  );
};

export default Banner;