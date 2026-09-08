import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Loader from '../components/Loader';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, format, differenceInDays } from "date-fns";

const Cardetails = () => {
  const { user, cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, setShowLogin } = useAppContext();
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

    // Auth guard — open login modal if not logged in
    if (!user) {
      setShowLogin(true);
      return;
    }

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
    <div className="bg-[#F5F0E7] min-h-screen pb-20">
      
      {/* Header Section */}
      <div className="bg-[#05091B] text-white pt-8 pb-10 border-b border-[#10172B] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#3D4C27]/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#8EA860]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb Navigation & Top Tags */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <BackButton fallback="/cars" variant="dark" />

            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1.5 text-xs font-extrabold uppercase bg-[#3D4C27] text-[#FAF7F0] border border-[#8EA860]/40 rounded-xl shadow-xs">
                {car.category || 'Luxury'}
              </span>
              
              {car.isAvailable && (
                <span className="px-3 py-1.5 text-xs font-extrabold uppercase bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 rounded-xl flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#3D4C27] animate-pulse"></span>
                  Available Now
                </span>
              )}
            </div>
          </div>

          {/* Title & Price Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#8EA860] block mb-1">
                {car.year || '2025'} Model • {car.category || 'SUV'}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {car.brand} <span className="text-[#8EA860]">{car.model}</span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8EA860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Dispatch Hub: <strong>{car.location || 'Central Station'}</strong></span>
              </p>
            </div>

            <div className="bg-[#10172B] border border-slate-700/80 px-6 py-3.5 rounded-2xl flex items-baseline gap-2 self-start md:self-auto shadow-md">
              <span className="text-xs font-extrabold uppercase text-slate-400">Rate</span>
              <span className="text-3xl sm:text-4xl font-black text-[#8EA860]">{currency}{car.pricePerDay}</span>
              <span className="text-slate-400 text-xs font-semibold">/ 24 hrs</span>
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Left Column: Showcase, Specs, Owner Details, Guidelines */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Stage Showcase */}
            <div className="relative w-full bg-[#05091B] rounded-3xl border border-[#10172B] shadow-xl overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,76,39,0.3)_0%,transparent_70%)] pointer-events-none"></div>
              
              <div className="w-full h-72 sm:h-96 flex items-center justify-center p-8 relative z-10">
                <img 
                  src={car.image} 
                  alt={`${car.brand} ${car.model}`} 
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-2xl"
                />
              </div>

              {/* High-visibility Plate and Badge on Stage */}
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between z-20">
                <span className="text-xs font-bold text-white bg-[#05091B]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#8EA860]"></span>
                  Verified Vehicle
                </span>

                {/* Big Plate on Image */}
                <div className="inline-flex items-center bg-white border-2 border-slate-900 rounded-lg shadow-xl overflow-hidden tracking-wider font-mono">
                  <div className="bg-[#003399] text-white font-extrabold text-[9px] px-2 py-1 flex flex-col items-center justify-center leading-none">
                    <span>IND</span>
                  </div>
                  <span className="px-3.5 py-1 text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest">
                    {car.number || 'MP09AB1234'}
                  </span>
                </div>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-[#E4D9C7] pb-3">
                <h2 className="text-base font-black text-[#05091B] flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3D4C27]"></span>
                  Vehicle Specifications
                </h2>
                <span className="text-[10px] font-extrabold uppercase text-[#3D4C27] bg-[#EBF0E4] px-2.5 py-0.5 rounded-md border border-[#3D4C27]/20">
                  Verified Inspection
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-[#F5F0E7] p-4 rounded-2xl border border-[#E4D9C7] flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Capacity</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-base font-black text-[#05091B]">{car.seating_capacity}</span>
                    <span className="text-xs text-[#64748B] font-bold">Seats</span>
                  </div>
                </div>

                <div className="bg-[#F5F0E7] p-4 rounded-2xl border border-[#E4D9C7] flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Fuel Type</span>
                  <span className="text-base font-black text-[#05091B] mt-2 truncate">{car.fuel_type}</span>
                </div>

                <div className="bg-[#F5F0E7] p-4 rounded-2xl border border-[#E4D9C7] flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Transmission</span>
                  <span className="text-base font-black text-[#05091B] mt-2 truncate">{car.transmission}</span>
                </div>

                <div className="bg-[#F5F0E7] p-4 rounded-2xl border border-[#E4D9C7] flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#64748B]">Plate Number</span>
                  <span className="text-sm font-black text-[#3D4C27] font-mono mt-2 truncate">{car.number || 'MP09AB1234'}</span>
                </div>
              </div>
            </div>

            {/* OWNER DETAILS SECTION */}
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-[#E4D9C7] pb-3">
                <h2 className="text-base font-black text-[#05091B] flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3D4C27]"></span>
                  Owner & Host Information
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-[#3D4C27] bg-[#EBF0E4] px-2.5 py-0.5 rounded-md border border-[#3D4C27]/20">
                  <svg className="w-3 h-3 text-[#3D4C27]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Host
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-[#F5F0E7] p-5 rounded-2xl border border-[#E4D9C7]">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {car.owner?.image ? (
                      <img 
                        src={car.owner.image} 
                        alt={car.owner?.name || car.ownerName || "Host"} 
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#3D4C27]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#3D4C27] text-[#FAF7F0] font-black text-xl flex items-center justify-center uppercase shadow-md">
                        {car.owner?.name ? car.owner.name.charAt(0) : (car.ownerName ? car.ownerName.charAt(0) : 'O')}
                      </div>
                    )}
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8EA860] border-2 border-white absolute -bottom-1 -right-1 shadow-xs"></span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#05091B]">
                      {car.owner?.name || car.ownerName || "Premium Partner"}
                    </h3>
                    <p className="text-xs text-stone-600 font-medium mt-0.5">
                      Verified Car Host • Dispatch Station: <strong>{car.location}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-[#E4D9C7] pt-3 sm:pt-0">
                  <span className="text-[10px] font-extrabold uppercase text-stone-500">Contact Number</span>
                  <span className="text-xs sm:text-sm font-black text-[#05091B] mt-0.5">
                    {car.owner?.phone_no || car.phone_no || "Provided upon confirmation"}
                  </span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-black text-[#05091B] mb-3 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D4C27]"></span>
                Vehicle Overview
              </h2>
              <p className="text-stone-800 text-xs sm:text-sm leading-relaxed font-medium">
                {car.description || `The ${car.brand} ${car.model} offers top-tier reliability, complete sanitized interiors, and proven mechanical performance for both city commutes and long highway road trips.`}
              </p>
            </div>

            {/* Guidelines */}
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-7 shadow-xs">
              <h2 className="text-base font-black text-[#05091B] mb-4 flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D4C27]"></span>
                Rental Guidelines & Safety
              </h2>
              <div className="grid sm:grid-cols-3 gap-3 text-xs text-stone-700">
                <div className="bg-[#F5F0E7] p-3.5 rounded-2xl border border-[#E4D9C7]">
                  <strong className="block text-[#05091B] font-bold mb-1">🪪 Driver's License</strong>
                  <span>Valid driving license required at physical handover.</span>
                </div>
                <div className="bg-[#F5F0E7] p-3.5 rounded-2xl border border-[#E4D9C7]">
                  <strong className="block text-[#05091B] font-bold mb-1">⛽ Fuel Policy</strong>
                  <span>Return with the same fuel level as dispatched.</span>
                </div>
                <div className="bg-[#F5F0E7] p-3.5 rounded-2xl border border-[#E4D9C7]">
                  <strong className="block text-[#05091B] font-bold mb-1">🛡️ 24/7 Roadside Aid</strong>
                  <span>Emergency roadside assistance and insurance included.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="w-full lg:w-1/3">
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sticky top-24 space-y-5 shadow-sm">
              
              {/* Daily Rate Header */}
              <div className="bg-[#05091B] text-white p-5 rounded-2xl flex items-baseline justify-between border border-[#10172B]">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#8EA860] block tracking-wider">Daily Rate</span>
                  <span className="text-3xl font-black text-white">{currency}{car.pricePerDay}</span>
                  <span className="text-slate-400 text-xs ml-1 font-semibold">/ day</span>
                </div>
                <span className="px-3 py-1 text-[10px] font-extrabold uppercase bg-[#3D4C27] text-[#FAF7F0] border border-[#8EA860]/30 rounded-lg">
                  {car.category || 'Standard'}
                </span>
              </div>

              <div className="pb-2 border-b border-[#E4D9C7]">
                <h3 className="text-sm font-black text-[#05091B]">Select Rental Dates</h3>
                <p className="text-xs text-stone-500 mt-0.5">Pick your journey timeline.</p>
              </div>
              
              <form onSubmit={handleContinueCheckout} className="space-y-4">
                
                {/* Pick-Up Date */}
                <div>
                  <label className="block text-xs font-extrabold text-[#05091B] uppercase tracking-wider mb-1.5">Pick-Up Date</label>
                  <DatePicker
                    selected={pickupDate ? new Date(pickupDate) : null}
                    onChange={(date) => {
                      if (date) setPickupDate(format(date, 'yyyy-MM-dd'));
                    }}
                    filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                    minDate={new Date()}
                    placeholderText="Select pickup date"
                    className="w-full px-3.5 py-2.5 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl focus:outline-none focus:border-[#3D4C27] text-xs font-bold text-[#111827]"
                  />
                </div>

                {/* Return Date */}
                <div>
                  <label className="block text-xs font-extrabold text-[#05091B] uppercase tracking-wider mb-1.5">Return Date</label>
                  <DatePicker
                    selected={returnDate ? new Date(returnDate) : null}
                    onChange={(date) => {
                      if (date) setReturnDate(format(date, 'yyyy-MM-dd'));
                    }}
                    filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                    minDate={pickupDate ? new Date(pickupDate) : new Date()}
                    placeholderText="Select return date"
                    className="w-full px-3.5 py-2.5 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl focus:outline-none focus:border-[#3D4C27] text-xs font-bold text-[#111827]"
                  />
                </div>

                {/* Price Breakdown */}
                {totalPrice > 0 && (
                  <div className="bg-[#F5F0E7] p-4 rounded-2xl border border-[#E4D9C7] space-y-2 mt-3">
                    <div className="flex justify-between text-xs text-stone-600 font-medium">
                      <span>{currency}{car.pricePerDay} × {totalPrice / car.pricePerDay} Days</span>
                      <span className="font-bold text-[#05091B]">{currency}{totalPrice}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E4D9C7] flex justify-between items-baseline">
                      <span className="text-xs font-black text-[#05091B] uppercase tracking-wider">Total</span>
                      <span className="text-2xl font-black text-[#3D4C27]">{currency}{totalPrice}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-lg shadow-[#3D4C27]/25 transition-all hover:scale-105 active:scale-95 mt-2 cursor-pointer uppercase tracking-wider"
                >
                  Continue to Checkout &rarr;
                </button>
              </form>

              {/* Perks */}
              <div className="pt-3 border-t border-[#E4D9C7] space-y-2 text-xs text-stone-600 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D4C27]"></span>
                  <span>Free cancellation 24 hours prior</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D4C27]"></span>
                  <span>Zero hidden fees • Full insurance coverage</span>
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