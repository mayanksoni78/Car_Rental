import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { differenceInDays } from "date-fns";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cars, axios, pickupDate, returnDate } = useAppContext();
  const [car, setCar] = useState(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  
  const [paymentState, setPaymentState] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS, FAILED
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    if (!pickupDate || !returnDate) {
      toast.error("Please select dates first.");
      navigate(`/car-details/${id}`);
      return;
    }
    const foundCar = cars.find(c => c._id === id);
    if (foundCar) {
      setCar(foundCar);
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      const days = Math.max(1, differenceInDays(end, start));
      setTotalDays(days);
      setTotalPrice(days * foundCar.pricePerDay);
    }
  }, [id, cars, pickupDate, returnDate, navigate]);

  const handleNextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePayment = async (paymentType) => {
    setPaymentState('PROCESSING');
    try {
      if (paymentType === 'PAY_NOW') {
        const { data } = await axios.post("/bookings/payment", { amount: totalPrice });
        if (!data.success) throw new Error(data.message || "Payment init failed");
        
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID; 
        const options = {
          key: razorpayKey,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Car Rental",
          description: "Car Booking Payment",
          order_id: data.order.id,
          handler: async function (response) {
            try {
              const bookingRes = await axios.post("/bookings/create", {
                car: id, pickupDate, returnDate, paymentId: response.razorpay_payment_id
              });
              if (bookingRes.data.success) {
                setPaymentState('SUCCESS');
                setBookingId(bookingRes.data.booking?._id || 'confirmed');
                setTimeout(() => navigate(`/confirmation/${bookingRes.data.booking?._id || 'confirmed'}`), 1500);
              } else {
                setPaymentState('FAILED');
                toast.error(bookingRes.data.message);
              }
            } catch (err) {
              setPaymentState('FAILED');
              toast.error("Booking failed after payment.");
            }
          },
          theme: { color: "#0d4b50" }
        };
        const razor = new window.Razorpay(options);
        razor.on('payment.failed', function (response){
          setPaymentState('FAILED');
          toast.error(response.error.description);
        });
        razor.open();
      } else {
        // PAY LATER
        const bookingRes = await axios.post("/bookings/create", {
          car: id, pickupDate, returnDate, paymentId: "PAY_LATER"
        });
        if (bookingRes.data.success) {
          setPaymentState('SUCCESS');
          setTimeout(() => navigate(`/confirmation/${bookingRes.data.booking?._id || 'confirmed'}`), 1500);
        } else {
          setPaymentState('FAILED');
          toast.error(bookingRes.data.message || "Booking failed");
        }
      }
    } catch (error) {
      setPaymentState('FAILED');
      toast.error(error.message || "Payment failed");
    }
  };

  if (!car) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Progress Bar */}
        <div className="bg-teal-900 p-6 flex flex-col md:flex-row justify-between items-center text-white">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Secure Checkout</h2>
          <div className="flex space-x-2 text-sm font-medium">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className={`flex items-center ${step !== 5 ? 'after:content-[""] after:w-4 after:md:w-8 after:h-0.5 after:bg-teal-700 after:ml-2' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= step ? 'bg-teal-400 text-teal-950' : 'bg-teal-800 text-teal-300'}`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-10">
          
          {/* STEP 1: Rental Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">1. Rental Details</h3>
              <div className="flex flex-col md:flex-row gap-6">
                <img src={car.image} alt={car.brand} className="w-full md:w-1/3 rounded-xl object-cover h-48 bg-gray-100" />
                <div className="flex-1 space-y-4">
                  <h4 className="text-2xl font-bold text-gray-800">{car.brand} {car.model}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="block font-semibold text-gray-500">Pickup Date</span>
                      {pickupDate}
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-500">Return Date</span>
                      {returnDate}
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-500">Location</span>
                      {car.location}
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-500">Duration</span>
                      {totalDays} Days
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={handleNextStep} className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 transition">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 2: Customer Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">2. Customer Details</h3>
              {user ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <input type="text" value={user.name || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email</label>
                    <input type="text" value={user.email || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-700" />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 flex flex-col items-center">
                  <p className="text-amber-800 mb-4 font-medium">Please login to continue with your booking.</p>
                  <button onClick={() => navigate('/login')} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700">Login</button>
                </div>
              )}
              
              <div className="flex justify-between mt-8">
                <button onClick={handlePrevStep} className="text-gray-500 font-semibold hover:text-gray-800 px-4 py-2">Back</button>
                <button onClick={handleNextStep} disabled={!user} className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 transition">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 3: Eligibility */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">3. Eligibility</h3>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user?.drivingLicenseStatus === 'Verified' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                    <i className={`fa-solid ${user?.drivingLicenseStatus === 'Verified' ? 'fa-check' : 'fa-triangle-exclamation'} text-2xl`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Driving License Verification</h4>
                    <p className={`text-sm ${user?.drivingLicenseStatus === 'Verified' ? 'text-green-600' : 'text-amber-600'}`}>Status: {user?.drivingLicenseStatus || 'Not Verified'}</p>
                  </div>
                </div>
                {user?.drivingLicenseStatus !== 'Verified' && (
                  <button onClick={() => window.location.href = `${axios.defaults.baseURL}/api/license/verify/start?userId=${user?._id}`} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                    Verify License Now
                  </button>
                )}
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={handlePrevStep} className="text-gray-500 font-semibold hover:text-gray-800 px-4 py-2">Back</button>
                <button onClick={handleNextStep} disabled={user?.drivingLicenseStatus !== 'Verified'} className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50 transition">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 4: Price Summary */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">4. Price Summary</h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Rate (${car.pricePerDay} x {totalDays} days)</span>
                    <span className="font-semibold">${totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes & Fees (0%)</span>
                    <span className="font-semibold">$0</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-3xl font-black text-teal-700">${totalPrice}</span>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={handlePrevStep} className="text-gray-500 font-semibold hover:text-gray-800 px-4 py-2">Back</button>
                <button onClick={handleNextStep} className="bg-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 transition">Proceed to Payment</button>
              </div>
            </div>
          )}

          {/* STEP 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">5. Payment</h3>
              
              {paymentState === 'PROCESSING' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                  <p className="text-teal-800 font-semibold animate-pulse">Processing your payment...</p>
                </div>
              )}

              {paymentState === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-check text-3xl"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">Payment Successful!</h4>
                  <p className="text-gray-500">Redirecting to confirmation...</p>
                </div>
              )}

              {paymentState === 'FAILED' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-xmark text-3xl"></i>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-800">Payment Failed</h4>
                  <p className="text-gray-500 mb-4">Please try again or select Pay Later.</p>
                  <button onClick={() => setPaymentState('IDLE')} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-900">Try Again</button>
                </div>
              )}

              {paymentState === 'IDLE' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => handlePayment('PAY_NOW')}
                    className="border-2 border-teal-100 rounded-xl p-6 cursor-pointer hover:border-teal-600 hover:shadow-md transition-all group relative"
                  >
                    <div className="absolute top-4 right-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                    <i className="fa-solid fa-credit-card text-3xl text-teal-600 mb-4"></i>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Pay Now</h4>
                    <p className="text-sm text-gray-500">Pay securely using your credit or debit card via Razorpay.</p>
                  </div>
                  <div 
                    onClick={() => handlePayment('PAY_LATER')}
                    className="border-2 border-amber-100 rounded-xl p-6 cursor-pointer hover:border-amber-500 hover:shadow-md transition-all group relative"
                  >
                    <div className="absolute top-4 right-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                    <i className="fa-solid fa-clock text-3xl text-amber-500 mb-4"></i>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">Pay Later</h4>
                    <p className="text-sm text-gray-500">Reserve now and pay when you pick up the vehicle. No card required.</p>
                  </div>
                </div>
              )}

              {paymentState === 'IDLE' && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <button onClick={handlePrevStep} className="text-gray-500 font-semibold hover:text-gray-800 px-4 py-2">Back</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
