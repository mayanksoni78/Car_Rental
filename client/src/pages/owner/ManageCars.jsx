import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import PageHeader from '../../components/owner/PageHeader';
import toast from 'react-hot-toast';

const ManageCars = () => {
  const { isOwner, axios, currency, cars, setCars, navigate } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchOwnerCars = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/owner/cars');
      if (data.success) {
        setCars(data.cars);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (carId) => {
    try {
      const { data } = await axios.post('/owner/toggle-car', { carId });
      if (data.success) {
        toast.success(data.message || "Status updated");
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteCar = async (carId) => {
    try {
      const confirm = window.confirm('Are you sure you want to remove this vehicle from your listings?');
      if (!confirm) return;

      const { data } = await axios.post('/owner/delete-car', { carId });
      if (data.success) {
        toast.success(data.message || "Vehicle removed");
        fetchOwnerCars();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchOwnerCars();
    }
  }, [isOwner]);

  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || car.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'All' || 
      (selectedStatus === 'Available' && car.isAvailable) || 
      (selectedStatus === 'Unavailable' && !car.isAvailable);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Electric'];

  return (
    <div className="space-y-6">
      <PageHeader
        showBack={true}
        backFallback="/owner"
        category="Car Inventory"
        title="My Cars"
        description="Manage and maintain your vehicle inventory, update availability, and track performance."
        action={
          <button
            onClick={() => navigate('/owner/add-car')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            + Add Car
          </button>
        }
      />

      {/* Filters & Search Bar */}
      <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by brand, model, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-xs sm:text-sm font-semibold text-[#05091B] placeholder-stone-400 focus:outline-none focus:border-[#3D4C27]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
          >
            {categories.map((cat, i) => (
              <option key={i} value={cat}>{cat} Vehicles</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Unavailable">Unavailable Only</option>
          </select>
        </div>

      </div>

      {/* Cars Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm font-medium">
          Loading vehicles...
        </div>
      ) : filteredCars.length === 0 ? (
        <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#05091B]">No Vehicles Found</h3>
            <p className="text-xs text-stone-500 mt-1">
              {searchTerm || selectedCategory !== 'All' ? 'Try clearing your filters or search term.' : 'You have not added any vehicles yet.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/owner/add-car')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <div
              key={car._id}
              className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl overflow-hidden shadow-xs hover:border-[#3D4C27]/60 hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Card Top: Image & Badges */}
              <div>
                <div className="relative aspect-video w-full bg-[#EAE3D2]/40 overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-[#05091B]/80 text-[#FAF7F0] backdrop-blur-xs">
                      {car.category || 'Sedan'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-xs ${
                      car.isAvailable
                        ? 'bg-[#EBF0E4]/95 text-[#3D4C27] border border-[#3D4C27]/40'
                        : 'bg-rose-500/90 text-white'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${car.isAvailable ? 'bg-[#3D4C27]' : 'bg-white'}`}></span>
                      {car.isAvailable ? 'Available' : 'Reserved/Off'}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-black text-[#05091B]">
                        {car.brand} {car.model}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {car.number ? `${car.number} • ${car.year || 2024}` : `${car.year || 2024}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#3D4C27]">
                        {currency}{car.pricePerDay?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400 font-semibold block">/day</span>
                    </div>
                  </div>

                  {/* Spec Row */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-600 bg-[#F5F0E7] p-2.5 rounded-xl border border-[#E4D9C7] justify-between">
                    <span>{car.transmission || 'Automatic'}</span>
                    <span>•</span>
                    <span>{car.fuel_type || 'Petrol'}</span>
                    <span>•</span>
                    <span>{car.seating_capacity || 5} Seats</span>
                    <span>•</span>
                    <span>{car.location || 'Delhi'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Buttons (Always Aligned) */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2.5 border-t border-[#E4D9C7]/60 mt-2">
                <button
                  onClick={() => toggleAvailability(car._id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    car.isAvailable
                      ? 'bg-[#FAF7F0] hover:bg-[#F5F0E7] border-[#E4D9C7] text-stone-700'
                      : 'bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] border-transparent'
                  }`}
                >
                  {car.isAvailable ? 'Set Inactive' : 'Set Available'}
                </button>

                <button
                  onClick={() => deleteCar(car._id)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-transparent hover:bg-rose-50 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ManageCars;
