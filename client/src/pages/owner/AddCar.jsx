import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import PageHeader from "../../components/owner/PageHeader";
import toast from "react-hot-toast";

const AddCar = () => {
  const { axios, currency, user, navigate } = useAppContext();

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [car, setCar] = useState({
    brand: '',
    model: '',
    number: '',
    year: 2024,
    pricePerDay: '',
    category: 'Sedan',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    seating_capacity: 5,
    location: 'Delhi',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!image) {
      toast.error("Please upload a vehicle showcase image");
      return;
    }

    if (!car.brand.trim() || !car.model.trim() || !car.pricePerDay) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('carData', JSON.stringify(car));

      const { data } = await axios.post('/owner/add-car', formData);

      if (data.success) {
        toast.success(data.message || "Vehicle added successfully!");
        navigate('/owner/manage-car');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to add car");
    } finally {
      setIsLoading(false);
    }
  };

  const cityList = [
    "Agra", "Ahmedabad", "Amritsar", "Bengaluru", "Bhopal",
    "Bhubaneswar", "Chandigarh", "Chennai", "Coimbatore", "Delhi",
    "Faridabad", "Goa", "Gurgaon", "Guwahati", "Hyderabad",
    "Indore", "Jaipur", "Jodhpur", "Kochi", "Kolkata",
    "Lucknow", "Ludhiana", "Mumbai", "Mysuru", "Nagpur",
    "Noida", "Patna", "Pune", "Surat", "Varanasi",
    "Visakhapatnam",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        showBack={true}
        backFallback="/owner/manage-car"
        category="Car Management"
        title="List a New Vehicle"
        description="Publish vehicle specifications, daily pricing, and dispatch location."
      />

      <form onSubmit={onSubmitHandler} className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
            Vehicle Showcase Photo <span className="text-red-500">*</span>
          </label>

          <label
            htmlFor="car-image-upload"
            className="flex flex-col items-center justify-center border-2 border-dashed border-[#E4D9C7] hover:border-[#3D4C27] rounded-2xl p-6 bg-[#F5F0E7] cursor-pointer transition-all group"
          >
            {imagePreview ? (
              <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden bg-white p-2 border border-[#E4D9C7]">
                <img
                  src={imagePreview}
                  alt="Car Preview"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-3 right-3 px-3 py-1 bg-[#05091B]/80 text-[#FAF7F0] text-[10px] font-bold rounded-lg backdrop-blur-xs">
                  Click to replace
                </span>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#05091B]">Click to upload car photo</p>
                  <p className="text-[11px] text-stone-500">PNG, JPG or WebP (Max 5MB)</p>
                </div>
              </div>
            )}
            <input
              type="file"
              id="car-image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>

        {/* 2-Column Structured Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Brand */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Brand / Manufacturer <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Toyota, Hyundai, BMW"
              value={car.brand}
              onChange={(e) => setCar({ ...car, brand: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fortuner, Creta, 3 Series"
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Vehicle Category <span className="text-red-500">*</span>
            </label>
            <select
              value={car.category}
              onChange={(e) => setCar({ ...car, category: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Luxury">Luxury</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          {/* Daily Rate */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Daily Rental Price ({currency}) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="100"
              placeholder="e.g. 3500"
              value={car.pricePerDay}
              onChange={(e) => setCar({ ...car, pricePerDay: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Registration Plate No.
            </label>
            <input
              type="text"
              placeholder="e.g. DL 01 AB 1234"
              value={car.number}
              onChange={(e) => setCar({ ...car, number: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Manufacturing Year
            </label>
            <input
              type="number"
              min="2000"
              max="2026"
              value={car.year}
              onChange={(e) => setCar({ ...car, year: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Transmission
            </label>
            <select
              value={car.transmission}
              onChange={(e) => setCar({ ...car, transmission: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Fuel Type
            </label>
            <select
              value={car.fuel_type}
              onChange={(e) => setCar({ ...car, fuel_type: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
            </select>
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Seating Capacity
            </label>
            <select
              value={car.seating_capacity}
              onChange={(e) => setCar({ ...car, seating_capacity: Number(e.target.value) })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
            >
              <option value={4}>4 Seats</option>
              <option value={5}>5 Seats</option>
              <option value={6}>6 Seats</option>
              <option value={7}>7 Seats</option>
              <option value={8}>8 Seats</option>
            </select>
          </div>

          {/* Location / City */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Pickup Location (City)
            </label>
            <select
              value={car.location}
              onChange={(e) => setCar({ ...car, location: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer"
            >
              {cityList.map((city, idx) => (
                <option key={idx} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Description (Full Width) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#05091B] mb-2">
              Vehicle Description & Features
            </label>
            <textarea
              rows={3}
              placeholder="Mention key features, condition, insurance, or rental rules..."
              value={car.description}
              onChange={(e) => setCar({ ...car, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-sm font-semibold text-[#05091B] focus:outline-none focus:border-[#3D4C27] focus:ring-1 focus:ring-[#3D4C27]"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[#E4D9C7] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/owner/manage-car')}
            className="px-5 py-2.5 bg-transparent hover:bg-[#EAE3D2] border border-[#E4D9C7] text-stone-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              'Save Vehicle'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddCar;
