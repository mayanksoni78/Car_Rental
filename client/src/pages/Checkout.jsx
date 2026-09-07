import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import { differenceInDays } from "date-fns";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, cars, axios, pickupDate, returnDate, currency } = useAppContext();
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
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handlePayment = async (paymentType) => {
    setPaymentState('PROCESSING');
    try {
      if (paymentType === 'PAY_NOW') {
        // 1. Initiate order on server with authoritative price calculation
        const { data } = await axios.post("/bookings/payment", { 
          carId: id,
          pickupDate,
          returnDate
        });
        
        if (!data.success || !data.order) {
          throw new Error(data.message || "Payment initiation failed");
        }
        
        const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error("Razorpay Client Key is missing in environment");
        }

        const options = {
          key: razorpayKey,
          amount: data.order.amount,
          currency: data.order.currency,
          name: "Car Rental",
          description: `Booking for ${car?.brand} ${car?.model}`,
          order_id: data.order.id,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          handler: async function (response) {
            try {
              // 2. Complete payment verification and atomic booking creation on server
              const bookingRes = await axios.post("/bookings/create", {
                car: id,
                pickupDate,
                returnDate,
                paymentType: 'PAY_NOW',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (bookingRes.data.success) {
                setPaymentState('SUCCESS');
                const realBookingId = bookingRes.data.bookingId || bookingRes.data.booking?._id;
                setBookingId(realBookingId);
                toast.success("Payment verified and booking confirmed!");
                setTimeout(() => navigate(`/confirmation/${realBookingId}`), 1200);
              } else {
                setPaymentState('FAILED');
                toast.error(bookingRes.data.message || "Payment verification failed.");
              }
            } catch (err) {
              setPaymentState('FAILED');
              toast.error(err.response?.data?.message || "Booking verification failed after payment.");
            }
          },
          modal: {
            ondismiss: function () {
              setPaymentState('IDLE');
              toast('Payment cancelled', { icon: 'ℹ️' });
            }
          },
          theme: { color: "#3D4C27" }
        };

        const razor = new window.Razorpay(options);
        razor.on('payment.failed', function (response) {
          setPaymentState('FAILED');
          toast.error(response.error?.description || "Payment authorization failed");
        });
        razor.open();
      } else {
        // PAY LATER flow
        const bookingRes = await axios.post("/bookings/create", {
          car: id,
          pickupDate,
          returnDate,
          paymentType: "PAY_LATER",
          paymentId: "PAY_LATER"
        });

        if (bookingRes.data.success) {
          setPaymentState('SUCCESS');
          const realBookingId = bookingRes.data.bookingId || bookingRes.data.booking?._id;
          setBookingId(realBookingId);
          toast.success("Reservation placed successfully!");
          setTimeout(() => navigate(`/confirmation/${realBookingId}`), 1200);
        } else {
          setPaymentState('FAILED');
          toast.error(bookingRes.data.message || "Booking failed");
        }
      }
    } catch (error) {
      setPaymentState('FAILED');
      toast.error(error.response?.data?.message || error.message || "Payment processing error");
    }
  };

  const curr = currency || '₹';

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F5F0E7] flex items-center justify-center text-[#00BFAE]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00BFAE]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#111827] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-5">
        <BackButton fallback={`/car-details/${id}`} />
      </div>

      <div className="max-w-4xl mx-auto bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl shadow-sm overflow-hidden">
        
        {/* Stepper Header */}
        <div className="bg-[#05091B] p-6 sm:p-8 border-b border-[#10172B] flex flex-col md:flex-row justify-between items-center gap-4 text-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8EA860]">Reservation Gateway</span>
            <h2 className="text-2xl font-black text-white mt-0.5">Secure Checkout</h2>
          </div>
          
          <div className="flex items-center space-x-2 text-xs font-bold">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`flex items-center ${step !== 4 ? 'after:content-[""] after:w-4 after:sm:w-8 after:h-0.5 after:bg-slate-700 after:ml-2' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                  currentStep === step 
                    ? 'bg-[#3D4C27] text-[#FAF7F0] font-black shadow-md shadow-[#3D4C27]/40 ring-2 ring-[#8EA860]' 
                    : currentStep > step 
                    ? 'bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 font-bold' 
                    : 'bg-[#10172B] text-slate-400 border border-slate-800'
                }`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#FAF7F0]">
          
          {/* STEP 1: Rental Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#E4D9C7] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C27]">Step 1 of 4</span>
                <h3 className="text-xl font-bold text-[#05091B]">Rental & Vehicle Details</h3>
              </div>

              <div className="flex flex-col md:flex-row gap-6 bg-[#F5F0E7] border border-[#E4D9C7] p-6 rounded-2xl">
                <div className="w-full md:w-1/3 h-44 bg-[#FAF7F0] rounded-xl flex items-center justify-center p-3 border border-[#E4D9C7]">
                  <img src={car.image} alt={car.brand} className="max-h-full max-w-full object-contain drop-shadow-md" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-xs font-bold uppercase text-[#3D4C27]">{car.category || 'Luxury'}</span>
                    <h4 className="text-2xl font-black text-[#05091B]">{car.brand} {car.model}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E4D9C7]">
                      <span className="block font-bold text-[#64748B] text-[11px] uppercase">Pick-Up Date</span>
                      <strong className="text-[#111827] text-sm">{pickupDate}</strong>
                    </div>
                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E4D9C7]">
                      <span className="block font-bold text-[#64748B] text-[11px] uppercase">Return Date</span>
                      <strong className="text-[#111827] text-sm">{returnDate}</strong>
                    </div>
                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E4D9C7]">
                      <span className="block font-bold text-[#64748B] text-[11px] uppercase">Dispatch Location</span>
                      <strong className="text-[#111827] text-sm">{car.location}</strong>
                    </div>
                    <div className="bg-[#FAF7F0] p-3 rounded-xl border border-[#E4D9C7]">
                      <span className="block font-bold text-[#64748B] text-[11px] uppercase">Total Duration</span>
                      <strong className="text-[#3D4C27] text-sm">{totalDays} Days</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#E4D9C7]">
                <button 
                  onClick={handleNextStep} 
                  className="px-8 py-3.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-sm rounded-xl shadow-lg shadow-[#3D4C27]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Continue to Customer Info &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Customer Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E4D9C7] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C27]">Step 2 of 4</span>
                <h3 className="text-xl font-bold text-[#05091B]">Renter Information</h3>
              </div>

              {user ? (
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Renter Full Name</label>
                    <input type="text" value={user.name || ''} disabled className="w-full bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl p-3.5 text-[#111827] font-semibold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Email Address</label>
                    <input type="text" value={user.email || ''} disabled className="w-full bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl p-3.5 text-[#111827] font-semibold text-sm" />
                  </div>
                </div>
              ) : (
                <div className="bg-[#F5F0E7] p-8 rounded-2xl border border-[#E4D9C7] text-center space-y-4">
                  <p className="text-[#64748B] font-medium">Please authenticate to continue with your reservation.</p>
                  <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-[#3D4C27] text-[#FAF7F0] font-bold rounded-xl hover:bg-[#4C5E31]">
                    Sign In
                  </button>
                </div>
              )}
              
              <div className="flex justify-between pt-6 border-t border-[#E4D9C7]">
                <button onClick={handlePrevStep} className="text-[#64748B] font-bold hover:text-[#05091B] px-4 py-2 cursor-pointer">
                  &larr; Back
                </button>
                <button 
                  onClick={handleNextStep} 
                  disabled={!user} 
                  className="px-8 py-3.5 bg-[#3D4C27] hover:bg-[#4C5E31] disabled:opacity-50 text-[#FAF7F0] font-black text-sm rounded-xl shadow-lg shadow-[#3D4C27]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Continue to Price Summary &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Price Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#E4D9C7] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C27]">Step 3 of 4</span>
                <h3 className="text-xl font-bold text-[#05091B]">Payment & Pricing Breakdown</h3>
              </div>

              <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl overflow-hidden">
                <div className="p-6 space-y-4 text-sm">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Base Vehicle Rate ({curr}{car.pricePerDay} × {totalDays} days)</span>
                    <span className="font-bold text-[#05091B]">{curr}{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Comprehensive Insurance & Breakdown Aid</span>
                    <span className="font-bold text-[#3D4C27]">FREE</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Applicable Taxes & Station Dispatch</span>
                    <span className="font-bold text-[#05091B]">{curr}0</span>
                  </div>
                </div>
                
                <div className="bg-[#05091B] p-6 flex justify-between items-center text-white">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 block">Total Payable</span>
                    <span className="text-xs text-[#8EA860] font-semibold">Zero hidden fees</span>
                  </div>
                  <span className="text-3xl font-black text-[#8EA860]">{curr}{totalPrice}</span>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-[#E4D9C7]">
                <button onClick={handlePrevStep} className="text-[#64748B] font-bold hover:text-[#05091B] px-4 py-2 cursor-pointer">
                  &larr; Back
                </button>
                <button 
                  onClick={handleNextStep} 
                  className="px-8 py-3.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-sm rounded-xl shadow-lg shadow-[#3D4C27]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  Proceed to Payment &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Payment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#E4D9C7] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C27]">Step 4 of 4</span>
                <h3 className="text-xl font-bold text-[#05091B]">Select Payment Mode</h3>
              </div>
              
              {paymentState === 'PROCESSING' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C27]"></div>
                  <p className="text-[#3D4C27] font-bold animate-pulse text-sm">Initiating secure payment gateway...</p>
                </div>
              )}

              {paymentState === 'SUCCESS' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                  <div className="w-16 h-16 bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-black text-[#05091B]">Payment Authorized!</h4>
                  <p className="text-[#64748B] text-xs">Redirecting to confirmation itinerary...</p>
                </div>
              )}

              {paymentState === 'FAILED' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="w-16 h-16 bg-rose-100 text-[#DC4C4C] border border-rose-300 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-black text-[#05091B]">Payment Unsuccessful</h4>
                  <p className="text-[#64748B] text-xs mb-2">Please retry or choose Pay at Pickup.</p>
                  <button onClick={() => setPaymentState('IDLE')} className="px-6 py-2.5 bg-[#05091B] text-white rounded-xl text-xs font-bold hover:bg-[#10172B]">
                    Try Again
                  </button>
                </div>
              )}

              {paymentState === 'IDLE' && (
                <div className="grid md:grid-cols-2 gap-5">
                  <div 
                    onClick={() => handlePayment('PAY_NOW')}
                    className="bg-[#F5F0E7] border border-[#E4D9C7] hover:border-[#3D4C27] p-6 rounded-2xl cursor-pointer transition-all group hover:-translate-y-1 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 flex items-center justify-center mb-4 group-hover:bg-[#3D4C27] group-hover:text-[#FAF7F0] transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-[#05091B] mb-1">Pay Online Now</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Instant confirmation via UPI, Cards, Netbanking with Razorpay.
                    </p>
                  </div>

                  <div 
                    onClick={() => handlePayment('PAY_LATER')}
                    className="bg-[#F5F0E7] border border-[#E4D9C7] hover:border-[#D89A35] p-6 rounded-2xl cursor-pointer transition-all group hover:-translate-y-1 shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mb-4 group-hover:bg-[#D89A35] group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-[#05091B] mb-1">Pay at Pick-Up</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Reserve vehicle immediately. Settle full amount during key handover.
                    </p>
                  </div>
                </div>
              )}

              {paymentState === 'IDLE' && (
                <div className="flex justify-between pt-6 border-t border-[#E4D9C7]">
                  <button onClick={handlePrevStep} className="text-[#64748B] font-bold hover:text-[#05091B] px-4 py-2 cursor-pointer">
                    &larr; Back
                  </button>
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

