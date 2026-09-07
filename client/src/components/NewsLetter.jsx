import React from 'react';

const NewsLetter = () => {
  return (
    <div className="py-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center space-y-3">
      <span className="text-[#3D4C27] font-bold text-xs uppercase tracking-widest bg-[#EBF0E4] border border-[#3D4C27]/30 px-3.5 py-1 rounded-full">
        Stay Updated
      </span>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#05091B] tracking-tight">
        Never Miss an Exclusive Offer!
      </h2>
      <p className="text-sm sm:text-base text-[#64748B] max-w-lg pb-6 leading-relaxed">
        Subscribe to receive prime seasonal discounts, new vehicle additions, and luxury vehicle upgrades.
      </p>
      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row items-center justify-between max-w-xl w-full gap-3">
        <input
          className="bg-[#FFFDF8] border border-[#E4D9C7] rounded-xl h-12 outline-none w-full px-4 text-[#111827] placeholder-[#64748B] focus:border-[#3D4C27] transition-colors"
          type="email"
          placeholder="Enter your email address"
          required
        />
        <button type="submit" className="w-full sm:w-auto px-8 h-12 text-[#FAF7F0] bg-[#3D4C27] hover:bg-[#4C5E31] font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#3D4C27]/20 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap">
          Subscribe
        </button>
      </form>
    </div>
  );
};

export default NewsLetter;