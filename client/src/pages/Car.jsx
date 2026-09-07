import React, { useContext, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useSearchParams } from 'react-router-dom';
import Title from '../components/Title';
import CarCard from '../components/CarCards';
import toast from 'react-hot-toast';

const Car = () => {
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { cars, axios } = useAppContext();
  const [filterCars, setFilterCars] = useState([]);
  const [input, setInput] = useState('');
  
  // Advanced filters state
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState([]);
  
  const isSearchData = pickupLocation && pickupDate && returnDate;

  const carList = Array.isArray(cars) ? cars : [];

  // Derived options for filters based on available cars
  const categories = [...new Set(carList.map(c => c?.category))].filter(Boolean);
  const fuelTypes = [...new Set(carList.map(c => c?.fuel_type))].filter(Boolean);
  const transmissions = [...new Set(carList.map(c => c?.transmission))].filter(Boolean);

  const applyFiltersAndSorting = (baseCars) => {
    let filtered = baseCars.slice();

    // 1. Text Search
    if (input) {
      filtered = filtered.filter(car => 
        car.brand?.toLowerCase().includes(input.toLowerCase()) ||
        car.model?.toLowerCase().includes(input.toLowerCase()) ||
        car.category?.toLowerCase().includes(input.toLowerCase()) ||
        car.transmission?.toLowerCase().includes(input.toLowerCase()) ||
        car.location?.toLowerCase().includes(input.toLowerCase())
      );
    }

    // 2. Category Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(car => selectedCategories.includes(car.category));
    }

    // 3. Fuel Type Filter
    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter(car => selectedFuelTypes.includes(car.fuel_type));
    }

    // 4. Transmission Filter
    if (selectedTransmissions.length > 0) {
      filtered = filtered.filter(car => selectedTransmissions.includes(car.transmission));
    }

    setFilterCars(filtered);
  };

  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post('/bookings/check-availability', { location: pickupLocation, pickupDate, returnDate });
      if (data.success) {
        if (data.availableCars.length === 0) {
          toast('No Car is Available for these dates.');
        }
        applyFiltersAndSorting(data.availableCars);
      }
    } catch (error) {
      toast.error('Failed to check availability.');
    }
  };

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability();
    } else {
      applyFiltersAndSorting(cars);
    }
  }, [input, selectedCategories, selectedFuelTypes, selectedTransmissions, cars]);

  const toggleFilter = (stateSetter, stateValue, value) => {
    if (stateValue.includes(value)) {
      stateSetter(stateValue.filter(item => item !== value));
    } else {
      stateSetter([...stateValue, value]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] pb-20">
      {/* Header Banner */}
      <div className="bg-[#05091B] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#10172B]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Available Cars</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Transparent daily rates with instant confirmation.
          </p>
          
          <div className="relative mt-4 w-full max-w-lg mx-auto">
            <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              onChange={(e) => setInput(e.target.value)} 
              value={input} 
              type="text" 
              placeholder='Search brand, model, or city...' 
              className="w-full border border-slate-700 bg-[#10172B] text-white placeholder-slate-400 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm focus:border-[#8EA860] focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex justify-between items-center mb-5">
          <p className="text-xs text-[#64748B] font-medium">
            Showing <span className="text-[#05091B] font-bold">{filterCars.length}</span> vehicles
          </p>
        </div>

        {filterCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filterCars.map((car, index) => (
              <CarCard key={index} car={car} />
            ))}
          </div>
        ) : (
          <div className="bg-[#FAF7F0] p-8 rounded-2xl text-center border border-[#E4D9C7] max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#EBF0E4] mb-2 text-[#3D4C27]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-[#05091B] mb-1">No cars found</h3>
            <p className="text-[#64748B] text-xs">Try adjusting your search keywords.</p>
            {input && (
              <button 
                onClick={() => setInput('')}
                className="mt-4 px-4 py-1.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Car;