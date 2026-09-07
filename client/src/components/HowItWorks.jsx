import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: "fa-solid fa-location-dot",
      title: "Choose Location",
      description: "Select your preferred pick-up and drop-off locations from our wide network of cities."
    },
    {
      id: 2,
      icon: "fa-regular fa-calendar",
      title: "Pick Dates",
      description: "Select your travel dates and times to check the availability of cars."
    },
    {
      id: 3,
      icon: "fa-solid fa-car",
      title: "Book Your Car",
      description: "Browse our extensive fleet of premium vehicles and find the perfect car for your needs."
    },
    {
      id: 4,
      icon: "fa-solid fa-road",
      title: "Hit the Road",
      description: "Complete the secure payment process and you're ready for your adventure."
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-500">Renting a car has never been easier. Follow these simple steps to get started on your journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gray-100 z-0"></div>

          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-50 shadow-xl flex items-center justify-center mb-6 group-hover:border-teal-100 group-hover:scale-110 transition-all duration-300">
                <i className={`${step.icon} text-3xl text-teal-600`}></i>
              </div>
              <div className="bg-teal-50 text-teal-700 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-4 absolute top-0 right-1/2 translate-x-12 -translate-y-2 border-2 border-white">
                {step.id}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
