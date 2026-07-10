import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isSameDay, format } from "date-fns";

const Cardetails = () => {

  const { currency, cars, axios, pickupDate, setPickupDate, returnDate, setReturnDate, navigate } = useAppContext()
  const { id } = useParams()

  const [car, setCar] = useState(null)
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const { data } = await axios.get(`/bookings/car/${id}`)
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
      }
      catch (error) {
        console.error("Error fetching booked dates:", error.message)
      }
    }
    fetchBookedDates()
  }, [id, axios]);

  // --- PAY NOW HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!pickupDate || !returnDate) {
      console.log("Validation Failed: Dates are empty");
      toast.error("Please select both Pickup and Return dates");
      return;
    }
    if (pickupDate === returnDate) {
      console.log("Validation Failed: Dates are same");
      toast.error("Pickup date and return date cannot be the same");
      return;
    }
    if (new Date(returnDate) < new Date(pickupDate)) {
      console.log("Validation Failed: Return is before pickup");
      toast.error("Return date must be after pickup date");
      return;
    }

    try {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalAmount = totalDays * car.pricePerDay;

      // create razorpay order
      const { data } = await axios.post("/bookings/payment", { amount: totalAmount });
      
      console.log("Response from /bookings/payment:", data);

      if (typeof data === 'string') {
        console.error("CRITICAL ERROR: The backend returned HTML instead of JSON. Check your API route or Base URL configuration.");
        toast.error("API Route Error. Check console.");
        return;
      }

      if (!data.success) {
        console.error("Backend returned success: false", data);
        toast.error(data.message || "Payment initialization failed");
        return;
      }

            // 👈 FIX: MUST HAVE VITE_ IN THE NAME!
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID; 
      console.log("Razorpay Key from .env:", razorpayKey);

      if (!razorpayKey) {
        console.error("CRITICAL ERROR: Razorpay Key is undefined! Ensure it is in your .env file as VITE_RAZORPAY_KEY_ID and YOU RESTARTED THE SERVER.");
        toast.error("Razorpay key is missing! Check console.");
        return;
      }

      console.log("Setting up Razorpay options...");
      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Car Rental",
        description: "Car Booking Payment",
        order_id: data.order.id,

       handler: async function (response) {

    try {

        const bookingRes = await axios.post(
            "/bookings/create",
            {
                car: id,
                pickupDate,
                returnDate,
                paymentId: response.razorpay_payment_id
            }
        );

        if (bookingRes.data.success) {
            toast.success("Payment Successful");
            navigate("/my-booking");
        } else {
            toast.error(bookingRes.data.message);
        }

    } catch (error) {
        toast.error(error.response?.data?.message || error.message);
    }

},
        theme: {
          color: "#2563eb"
        }
      };

      console.log("Opening Razorpay window...");
      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error("Pay Now Caught Error:", error);
      toast.error(error?.response?.data?.message || error.message || "An unknown error occurred");
    } 
  }; 

  
  const handlePayLater = async (e) => {
    e.preventDefault();
    console.log("--- PAY LATER BUTTON CLICKED ---");
    console.log("Pickup Date:", pickupDate);
    console.log("Return Date:", returnDate);
    
    if (!pickupDate || !returnDate) {
      toast.error("Please select both Pickup and Return dates");
      return;
    }
    if (pickupDate === returnDate) {
      toast.error("Pickup date and return date cannot be the same");
      return;
    }
    if (new Date(returnDate) < new Date(pickupDate)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    try {
      console.log("Sending request to /bookings/create with PAY_LATER...");
      const bookingRes = await axios.post("/bookings/create", {
          car: id,
          pickupDate,
          returnDate,
          paymentId: "PAY_LATER" 
      });

      console.log("Response from /bookings/create:", bookingRes.data);

      if (typeof bookingRes.data === 'string') {
        console.error("CRITICAL ERROR: The backend returned HTML instead of JSON. Check your API route or Base URL configuration.");
        toast.error("API Route Error. Check console.");
        return;
      }

      if (bookingRes.data.success) {
        toast.success("Booking Successful! Pay at pickup.");
        navigate("/my-booking");
      } else {
        toast.error(bookingRes.data.message || "Booking failed");
      }
    } catch (error) {
      console.error("Pay Later Caught Error:", error);
      toast.error(error?.response?.data?.message || error.message || "An unknown error occurred");
    }
  };

  useEffect(() => {
    setCar(cars.find(car => car._id === id))
  }, [cars, id])

  return car ? (
    <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 bg-[#efeedd] min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 mb-4 sm:mb-6 transition">
        <i className="fa-solid fa-arrow-left"></i>
        Back to all cars
      </button>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="flex-1 bg-white rounded-xl shadow-md p-3 sm:p-5 md:p-6">
          <img src={car.image} alt="car-image" className="w-full sm:w-72 md:w-80 h-44 sm:h-48 object-cover rounded-lg mb-4" />
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                {car.brand} {car.model}
                <span className="ml-2 text-base font-normal text-gray-500">({car.number})</span>
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">{car.category}</span>
                <span>•</span>
                <span>{car.year}</span>
              </p>
            </div>

            <hr className="border-amber-100" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { icon: "fa-solid fa-user-group", text: `${car.seating_capacity} Seats`, color: "text-blue-600" },
                { icon: "fa-solid fa-gas-pump", text: car.fuel_type, color: "text-green-600" },
                { icon: "fa-solid fa-car-side", text: car.transmission, color: "text-purple-600" },
                { icon: "fa-solid fa-location-dot", text: car.location, color: "text-red-600" }
              ].map(({ icon, text, color }) => (
                <div key={text} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-amber-50 transition-colors group">
                  <i className={`${icon} ${color} text-lg group-hover:scale-110 transition-transform`}></i>
                  <span className="text-gray-700 font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-[#e4f9ff] to-[#8de0f0] p-4 rounded-xl border border-amber-100">
              <h2 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-teal-600"></i>
                Description
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">{car.description}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded-xl">
              <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                <i className="fa-solid fa-user text-teal-600"></i>
                Owner Details
              </h2>
              <div className="space-y-1">
                <p className="text-sm text-gray-800 font-semibold">{car.ownerName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <i className="fa-solid fa-phone text-teal-600"></i>
                  {car.phone_no}
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                <i className="fa-solid fa-star text-amber-500"></i>
                Premium Features
              </h2>
              <ul className="grid grid-cols-2 gap-3">
                {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                  <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg hover:bg-teal-50 transition-colors group" key={item}>
                    <i className="fa-solid fa-check text-green-500 group-hover:scale-125 transition-transform"></i>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full lg:w-80 bg-white rounded-xl shadow-md p-3 sm:p-5 md:p-6 space-y-4">

          <div className="bg-gradient-to-br from-[#25bbcc] to-[#09413f] text-white p-4  -m-6 mb-4">
            <p className="text-3xl font-bold">₹{car.pricePerDay}</p>
            <span className="text-sm text-teal-100">per day</span>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="fa-solid fa-calendar-check text-[#09413f]"></i>Pickup Date</label>
            <DatePicker
              selected={pickupDate ? new Date(pickupDate) : null}
              onChange={(date) =>{
                 if (date) setPickupDate(format(date, 'yyyy-MM-dd'));
              }}
              filterDate={(date) =>
                !bookedDates.some((bookedDate) =>
                  isSameDay(bookedDate, date)
                )
              }
              minDate={new Date()}
              placeholderText="Select Pickup Date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <i className="fa-solid fa-calendar-check text-[#09413f]"></i>
              Return Date
            </label>

            <DatePicker
              selected={returnDate ? new Date(returnDate) : null}
              onChange={(date) =>{
                 if (date) setReturnDate(format(date, 'yyyy-MM-dd'));
              }}
              filterDate={(date) =>
                !bookedDates.some((bookedDate) =>
                  isSameDay(bookedDate, date)
                )
              }
              minDate={pickupDate ? new Date(pickupDate) : new Date()}
              placeholderText="Select Return Date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium">
              Pay Now
            </button>
            <button type="button" onClick={handlePayLater}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition text-sm sm:text-base font-medium">
              Pay Later
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 text-center"> No credit card required to reserve (Pay Later)</p>
        </form>
      </div>

    </div>
  ) : <Loader />
}

export default Cardetails