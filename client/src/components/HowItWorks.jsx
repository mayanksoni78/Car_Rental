import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Select Location",
      desc: "Choose from 10+ major cities and pickup points across the nation."
    },
    {
      step: "02",
      title: "Choose Dates",
      desc: "Pick your departure and return schedule with instant live availability."
    },
    {
      step: "03",
      title: "Book & Pay",
      desc: "Secure online checkout powered by Razorpay with zero hidden charges."
    },
    {
      step: "04",
      title: "Drive Away",
      desc: "Pick up your spotless, sanitized car and hit the open road with ease."
    }
  ];

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-teal-600 font-bold text-xs uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full">
            Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Rent your favorite car in 4 simple steps without paperwork hassles.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-300 relative group flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl font-black text-slate-200 group-hover:text-teal-500 transition-colors duration-300">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="w-8 h-1 bg-slate-100 group-hover:bg-teal-500 rounded-full mt-6 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
