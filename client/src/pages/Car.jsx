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
  const [priceRange, setPriceRange] = useState(2000);
  const [sortOption, setSortOption] = useState('price-low-high');
  
  const isSearchData = pickupLocation && pickupDate && returnDate;

  // Derived options for filters based on available cars
  const categories = [...new Set(cars.map(c => c.category))].filter(Boolean);
  const fuelTypes = [...new Set(cars.map(c => c.fuel_type))].filter(Boolean);
  const transmissions = [...new Set(cars.map(c => c.transmission))].filter(Boolean);
  const maxPrice = Math.max(...cars.map(c => c.pricePerDay || 0), 2000);

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

    // 5. Price Range Filter
    filtered = filtered.filter(car => (car.pricePerDay || 0) <= priceRange);

    // 6. Sorting
    filtered.sort((a, b) => {
      if (sortOption === 'price-low-high') {
        return (a.pricePerDay || 0) - (b.pricePerDay || 0);
      } else if (sortOption === 'price-high-low') {
        return (b.pricePerDay || 0) - (a.pricePerDay || 0);
      }
      return 0;
    });

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
  }, [input, selectedCategories, selectedFuelTypes, selectedTransmissions, priceRange, sortOption, cars]);

  useEffect(() => {
    if (cars.length > 0) {
      setPriceRange(maxPrice);
    }
  }, [cars]);

  const toggleFilter = (stateSetter, stateValue, value) => {
    if (stateValue.includes(value)) {
      stateSetter(stateValue.filter(item => item !== value));
    } else {
      stateSetter([...stateValue, value]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-teal-900 py-12 px-4 sm:px-6 md:px-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Available Cars</h1>
        <p className="text-teal-100 text-sm md:text-base max-w-2xl mx-auto">Browse our selection of Premium Vehicles for your next adventure</p>
        
        <div className="relative mt-8 w-full max-w-2xl mx-auto">
          <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            onChange={(e) => setInput(e.target.value)} 
            value={input} 
            type="text" 
            placeholder='Search by brand, model, category, or location...' 
            className="w-full border-0 shadow-lg rounded-full pl-12 pr-6 py-4 text-sm sm:text-base bg-white focus:ring-4 focus:ring-teal-500/30 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Filters</h2>
            <button 
              onClick={() => {
                setSelectedCategories([]);
                setSelectedFuelTypes([]);
                setSelectedTransmissions([]);
                setPriceRange(maxPrice);
                setInput('');
              }}
              className="text-xs text-teal-600 font-semibold hover:text-teal-800"
            >
              Reset All
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Max Price: ${priceRange}</h3>
            <input 
              type="range" 
              min="0" 
              max={maxPrice} 
              value={priceRange} 
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>$0</span>
              <span>${maxPrice}</span>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Category</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleFilter(setSelectedCategories, selectedCategories, category)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fuel Types */}
          {fuelTypes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Fuel Type</h3>
              <div className="space-y-2">
                {fuelTypes.map(fuel => (
                  <label key={fuel} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedFuelTypes.includes(fuel)}
                      onChange={() => toggleFilter(setSelectedFuelTypes, selectedFuelTypes, fuel)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">{fuel}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Transmissions */}
          {transmissions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Transmission</h3>
              <div className="space-y-2">
                {transmissions.map(trans => (
                  <label key={trans} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedTransmissions.includes(trans)}
                      onChange={() => toggleFilter(setSelectedTransmissions, selectedTransmissions, trans)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">{trans}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Car Grid */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 font-medium">Showing <span className="text-teal-700 font-bold">{filterCars.length}</span> Cars</p>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-sm border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 py-2 pl-3 pr-8"
              >
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          {filterCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterCars.map((car, index) => (
                <CarCard key={index} car={car} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No cars found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedFuelTypes([]);
                  setSelectedTransmissions([]);
                  setPriceRange(maxPrice);
                  setInput('');
                }}
                className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Car;