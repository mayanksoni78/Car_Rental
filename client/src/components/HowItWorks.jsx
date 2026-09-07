import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      title: "Choose City",
      desc: "Select your preferred pickup point."
    },
    {
      step: "02",
      title: "Set Dates",
      desc: "Pick your departure and return time."
    },
    {
      step: "03",
      title: "Reserve",
      desc: "Instant booking with Razorpay or Pay at Pickup."
    },
    {
      step: "04",
      title: "Drive",
      desc: "Pick up keys and enjoy your journey."
    }
  ];

  return (
    <section className="py-16 bg-[#FAF7F0] border-y border-[#E4D9C7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#05091B] tracking-tight mb-2">
            How It Works
          </h2>
          <p className="text-[#64748B] text-xs sm:text-sm">
            4 simple steps to get behind the wheel.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((item, idx) => (
            <div 
              key={idx} 
              className="bg-[#F5F0E7] p-6 rounded-2xl border border-[#E4D9C7] hover:border-[#3D4C27] transition-all relative group flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-[#3D4C27]/40 group-hover:text-[#3D4C27] transition-colors">
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-[#05091B] mt-3 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[#64748B] text-xs leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
