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
  }, [id, axios]);

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

  return car ? (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Image Section */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] bg-teal-950 overflow-hidden">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`} 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-teal-300 hover:text-white mb-4 transition">
                <i className="fa-solid fa-arrow-left"></i>
                Back to all cars
              </button>
              <h1 className="text-3xl md:text-5xl font-black mb-2">
                {car.brand} {car.model}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 font-medium">
                {car.year} • {car.category}
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 inline-block">
              <span className="text-3xl font-bold text-white">${car.pricePerDay}</span>
              <span className="text-teal-100 ml-1">/ day</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8 flex flex-col lg:flex-row gap-8">
        {/* Main Details */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Quick Specs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-car text-teal-600"></i>
              Specifications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-user-group text-2xl text-teal-600 mb-2"></i>
                <span className="text-sm font-semibold text-gray-700">{car.seating_capacity} Seats</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-gas-pump text-2xl text-teal-600 mb-2"></i>
                <span className="text-sm font-semibold text-gray-700">{car.fuel_type}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-gear text-2xl text-teal-600 mb-2"></i>
                <span className="text-sm font-semibold text-gray-700">{car.transmission}</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl">
                <i className="fa-solid fa-location-dot text-2xl text-teal-600 mb-2"></i>
                <span className="text-sm font-semibold text-gray-700">{car.location}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-file-lines text-teal-600"></i>
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {car.description || `Experience the thrill of driving the ${car.brand} ${car.model}. This ${car.year} ${car.category} offers premium comfort, advanced safety features, and excellent performance. Perfect for both city driving and long road trips.`}
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-star text-amber-500"></i>
              Premium Features
            </h2>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["360 Camera", "Bluetooth Audio", "GPS Navigation", "Heated Seats", "Apple CarPlay", "Sunroof"].map((item) => (
                <li className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-xl" key={item}>
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                    <i className="fa-solid fa-check text-teal-600 text-xs"></i>
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Rental Rules */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-teal-600"></i>
              Rental Rules
            </h2>
            <ul className="space-y-3 text-gray-600 text-sm">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation text-amber-500 mt-1"></i>
                <span>Minimum age to rent is 21 years old. A valid driver's license is required.</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation text-amber-500 mt-1"></i>
                <span>Smoking is strictly prohibited in the vehicle. A cleaning fee will apply.</span>
              </li>
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation text-amber-500 mt-1"></i>
                <span>Vehicle must be returned with the same amount of fuel as at pickup.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Book this car</h3>
            
            <form onSubmit={handleContinueCheckout} className="space-y-6">
              
              {/* Date Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-calendar-check text-teal-600"></i>
                    </div>
                    <DatePicker
                      selected={pickupDate ? new Date(pickupDate) : null}
                      onChange={(date) => {
                        if (date) setPickupDate(format(date, 'yyyy-MM-dd'));
                      }}
                      filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                      minDate={new Date()}
                      placeholderText="Select pickup date"
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-calendar-check text-teal-600"></i>
                    </div>
                    <DatePicker
                      selected={returnDate ? new Date(returnDate) : null}
                      onChange={(date) => {
                        if (date) setReturnDate(format(date, 'yyyy-MM-dd'));
                      }}
                      filterDate={(date) => !bookedDates.some((bookedDate) => isSameDay(bookedDate, date))}
                      minDate={pickupDate ? new Date(pickupDate) : new Date()}
                      placeholderText="Select return date"
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary */}
              {totalPrice > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>${car.pricePerDay} x {totalPrice / car.pricePerDay} days</span>
                    <span className="font-semibold">${totalPrice}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-gray-800 font-bold text-lg">
                    <span>Total Rate</span>
                    <span className="text-teal-700">${totalPrice}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98]"
              >
                Continue to Checkout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : <Loader />
}

export default Cardetails;