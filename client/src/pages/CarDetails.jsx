import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, format, differenceInDays } from "date-fns";

const Cardetails = () => {
  const { user, cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate } = useAppContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data } = await axios.get(`/bookings/car/${id}`);
        if (data.success) {
          const dates = [];
          data.bookings.forEach((booking) => {
            const start = new Date(booking.pickupDate);
            const end = new Date(booking.returnDate);
            while (start <= end) {
              dates.push(new Date(start.getFullYear(), start.getMonth(), start.getDate()));
              start.setDate(start.getDate() + 1);
            }
          });
          setBookedDates(dates);
        }
      } catch (error) {
        console.error("Error fetching booked dates:", error.message);
      }
    };
    fetchBookedDates();
  }, [id]);

  useEffect(() => {
    setCar(cars.find(c => c._id === id));
  }, [cars, id]);

  useEffect(() => {
    if (pickupDate && returnDate && car) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const days = differenceInDays(end, start);
      if (days > 0) {
        setTotalPrice(days * car.pricePerDay);
      } else {
        setTotalPrice(0);
      }
    } else {
      setTotalPrice(0);
    }
  }, [pickupDate, returnDate, car]);

  const handleContinueCheckout = (e) => {
    e.preventDefault();
    if (!pickupDate || !returnDate) {
      toast.error("Please select both Pickup and Return dates");
      return;
    }
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    if (start >= end) {
      toast.error("Return date must be after pickup date");
      return;
    }
    
    // Check if dates overlap with booked dates
    let currentDate = new Date(start);
    while (currentDate <= end) {
      if (bookedDates.some(booked => isSameDay(booked, currentDate))) {
        toast.error("Selected dates include already booked dates.");
        return;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Navigate to checkout
    navigate(`/checkout/${id}`);
  };

  const currency = import.meta.env.VITE_CURRENCY || '₹';

  return car ? (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Refined Header Section */}
      <div className="bg-slate-950 text-white pt-8 pb-10 border-b border-slate-800/80 relative overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/cars')} 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-teal-400 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-xl transition-all group cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All Vehicles
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-lg">
                {car.category || 'Luxury'}
              </span>
              {car.isAvailable && (
                <span className="px-3 py-1 text-xs font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg hidden sm:flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready for Dispatch
                </span>
              )}
            </div>
          </div>

          {/* Title & Price Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Premium Rental Fleet
              </span>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                {car.brand} <span className="text-teal-400">{car.model}</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-3">
                <span>Model Year: <strong className="text-slate-200">{car.year || '2024'}</strong></span>
                <span>•</span>
                <span>Location: <strong className="text-slate-200">{car.location || 'Central Station'}</strong></span>
              </p>
            </div>

            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 px-6 py-4 rounded-2xl flex items-baseline gap-2 shadow-2xl self-start md:self-auto">
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Daily Rate</span>
              <span className="text-3xl sm:text-4xl font-black text-white">{currency}{car.pricePerDay}</span>
              <span className="text-slate-400 text-xs font-semibold">/ day</span>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Column: Image Showcase + Vehicle Details (2/3 width) */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Showcase Vehicle Stage */}
            <div className="relative w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden group">
              {/* Subtle Studio Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.18)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="w-full h-72 sm:h-[400px] flex items-center justify-center p-6 sm:p-10 relative z-10">
                <img 
                  src={car.image} 
                  alt={`${car.brand} ${car.model}`} 
                  className="max-w-full max-h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.85)] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>

              {/* Bottom Vehicle Badges */}
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className="text-[11px] font-bold text-slate-400 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800">
                  Verified & Inspected
                </span>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-800">
                  Plate: {car.number || 'Verified'}
                </span>
              </div>
            </div>

            {/* Quick Specifications */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Key Specifications
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100/90 flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Seating</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-2">{car.seating_capacity} Passenger</span>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100/90 flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Fuel Type</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-2">{car.fuel_type}</span>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100/90 flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Transmission</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-2">{car.transmission}</span>
                </div>

                <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100/90 flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">City / Hub</span>
                  <span className="text-lg font-extrabold text-slate-900 mt-2 truncate">{car.location}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Vehicle Overview
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {car.description || `The ${car.brand} ${car.model} combines refined performance with everyday practicality. Designed to deliver optimal safety, comfortable seating, and smooth handling for your business travel, weekend getaways, or city commutes.`}
              </p>
            </div>

            {/* Included Features */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Standard Fleet Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {["Digital Navigation", "Bluetooth & CarPlay", "HD Reverse Camera", "Dual-Zone Climate", "Fast USB Charging", "Sanitized Interior"].map((item) => (
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100/90" key={item}>
                    <div className="w-6 h-6 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-xs font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 stroke-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rental Rules */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                Rental Policy & Guidelines
              </h2>
              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 stroke-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span><strong>Eligibility:</strong> Renters must be at least 21 years of age with an active driving license.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 stroke-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span><strong>Fuel Policy:</strong> Full-to-full or return with equivalent fuel gauge reading at checkout.</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 stroke-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span><strong>Assistance:</strong> Complimentary 24/7 breakdown recovery and roadside concierge included.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Date & Checkout Card (1/3 width, sticky) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-7 sticky top-24 space-y-5">
              
              {/* Daily Rate Header Card */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xl flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 block">Daily Rental</span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{currency}{car.pricePerDay}</span>
                  <span className="text-slate-400 text-xs font-semibold ml-1">/ day</span>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold uppercase bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-lg">
                  {car.category || 'Luxury'}
                </span>
              </div>

              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Select Booking Dates</h3>
                <p className="text-xs text-slate-400 mt-0.5">Instant confirmation with zero hidden fees.</p>
              </div>
              
              <form onSubmit={handleContinueCheckout} className="space-y-4">
                
                {/* Date Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pick-Up Date</label>
                  <DatePicker
                    selected={pickupDate ? new Date(pickupDate) : null}
                    onChange={(date) => {
                      if (date) setPickupDate(format(date, 'yyyy-MM-dd'));
                    }}
                    filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                    minDate={new Date()}
                    placeholderText="Select pickup date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500 transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Return Date</label>
                  <DatePicker
                    selected={returnDate ? new Date(returnDate) : null}
                    onChange={(date) => {
                      if (date) setReturnDate(format(date, 'yyyy-MM-dd'));
                    }}
                    filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                    minDate={pickupDate ? new Date(pickupDate) : new Date()}
                    placeholderText="Select return date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-teal-500 transition-all text-sm font-semibold text-slate-800"
                  />
                </div>

                {/* Price Breakdown */}
                {totalPrice > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 mt-4">
                    <div className="flex justify-between text-xs sm:text-sm text-slate-500">
                      <span>{currency}{car.pricePerDay} × {totalPrice / car.pricePerDay} Days</span>
                      <span className="font-bold text-slate-800">{currency}{totalPrice}</span>
                    </div>
                    <div className="pt-2.5 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-900">Total Price</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900">{currency}{totalPrice}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-md shadow-teal-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2 cursor-pointer"
                >
                  Continue to Checkout
                </button>
              </form>

              {/* Quick Perks */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs font-medium text-slate-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Free cancellation up to 24 hours before pickup</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 font-bold">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Comprehensive insurance & 24/7 roadside aid</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  ) : <Loader />;
};

export default Cardetails;