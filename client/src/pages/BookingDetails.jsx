import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { axios, user, currency } = useAppContext();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      const { data } = await axios.get('/bookings/user');
      if (data.success) {
        const found = data.booking.find(b => b._id === bookingId);
        if (found) {
          setBooking(found);
        } else {
          toast.error("Booking not found");
          navigate('/my-booking');
        }
      }
    } catch (error) {
      toast.error("Error fetching booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBooking();
    }
  }, [bookingId, user?._id, axios, navigate]);

  const handleDownloadPDF = async () => {
    if (!booking?._id) {
      toast.error("Invalid booking ID");
      return;
    }

    try {
      toast.loading("Generating PDF invoice...", { id: "invoice-download" });
      const response = await axios.get(`/bookings/${booking._id}/receipt`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CarRental_Invoice_${booking._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded!", { id: "invoice-download" });
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice PDF.", { id: "invoice-download" });
    }
  };

  const handlePayNow = async () => {
    if (!booking?._id) return;
    try {
      toast.loading("Initiating payment gateway...", { id: `pay-${booking._id}` });
      const { data } = await axios.post(`/bookings/${booking._id}/pay-order`);

      if (!data.success || !data.order) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay Client Key is missing in environment");
      }

      toast.dismiss(`pay-${booking._id}`);

      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Car Rental",
        description: `Settle booking for ${booking.car?.brand || 'Car'}`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "verify-pay" });
            const verifyRes = await axios.post(`/bookings/${booking._id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              toast.success("Payment verified! Booking confirmed.", { id: "verify-pay" });
              fetchBooking();
            } else {
              toast.error(verifyRes.data.message || "Payment verification failed", { id: "verify-pay" });
            }
          } catch (verErr) {
            toast.error(verErr.response?.data?.message || "Payment confirmation error", { id: "verify-pay" });
          }
        },
        theme: { color: "#3D4C27" }
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Payment failed", { id: `pay-${booking._id}` });
      if (err.response?.status === 409) {
        fetchBooking();
      }
    }
  };

  const curr = currency || '₹';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F0E7] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D4C27]"></div>
      </div>
    );
  }

  if (!booking) return null;

  const isUnpaid = booking.paymentStatus !== 'paid' && booking.status !== 'cancelled';
  const isCancelled = booking.status === 'cancelled';

  const formatDeadline = (deadlineDate) => {
    if (!deadlineDate) return null;
    const d = new Date(deadlineDate);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#05091B] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Back Button */}
        <div>
          <BackButton fallback="/my-booking" />
        </div>

        {/* Cancellation Alert Banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">Booking Cancelled</h4>
              <p className="text-xs text-red-700 mt-0.5">
                {booking.cancellationReason || "This booking was cancelled."}
                {booking.cancelledAt && ` (${new Date(booking.cancelledAt).toLocaleDateString()})`}
              </p>
            </div>
          </div>
        )}

        {/* Unpaid Payment Deadline Alert Banner */}
        {isUnpaid && (
          <div className="bg-[#FFF8EE] border border-[#F0D5AA] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#78350F] uppercase tracking-wide">Payment Pending — Action Required</h4>
                <p className="text-xs text-[#92400E] mt-0.5">
                  Complete payment before <span className="font-bold">{formatDeadline(booking.paymentDeadline) || 'the pickup date'}</span> to avoid automated cancellation.
                </p>
              </div>
            </div>

            <button
              onClick={handlePayNow}
              className="px-4 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Pay Online Now
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl shadow-xs overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#05091B] p-6 sm:p-7 border-b border-[#10172B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8EA860]">Reservation Summary</span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">Trip Details</h1>
              <p className="text-slate-400 font-mono text-xs mt-1">ID: {booking._id}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-xl font-bold text-xs uppercase tracking-wider ${
                booking.status === 'confirmed' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 
                booking.status === 'cancelled' 
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {booking.status}
              </span>
              
              <button 
                onClick={handleDownloadPDF} 
                className="px-3.5 py-1.5 bg-[#0D1424] hover:bg-[#152038] text-[#8EA860] border border-[#1E293B] hover:border-[#3D4C27]/40 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-[#8EA860]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Invoice
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid md:grid-cols-2 gap-6">
            
            {/* Left Column: Car Info */}
            <div className="space-y-5">
              <div className="bg-[#FAF7F0] border border-[#E4D9C7] p-5 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Vehicle Details</h3>
                <div className="w-full h-40 bg-[#F5F0E7] rounded-xl flex items-center justify-center p-3 border border-[#E4D9C7] mb-4">
                  <img src={booking.car?.image} alt={booking.car?.brand} className="max-h-full max-w-full object-contain" />
                </div>
                
                <h4 className="text-lg font-black text-[#05091B]">{booking.car?.brand} {booking.car?.model}</h4>
                <p className="text-xs text-[#64748B] mt-0.5">{booking.car?.year} • {booking.car?.category || 'Standard'}</p>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-[#F5F0E7] p-2.5 rounded-lg border border-[#E4D9C7] text-[#05091B]">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Fuel</span>
                    {booking.car?.fuel_type || 'Petrol'}
                  </div>
                  <div className="bg-[#F5F0E7] p-2.5 rounded-lg border border-[#E4D9C7] text-[#05091B]">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Transmission</span>
                    {booking.car?.transmission || 'Automatic'}
                  </div>
                  <div className="bg-[#F5F0E7] p-2.5 rounded-lg border border-[#E4D9C7] text-[#05091B]">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Seating</span>
                    {booking.car?.seating_capacity || 5} Passengers
                  </div>
                  <div className="bg-[#F5F0E7] p-2.5 rounded-lg border border-[#E4D9C7] text-[#05091B]">
                    <span className="text-[#64748B] block text-[10px] uppercase font-bold">Plate</span>
                    {booking.car?.number || 'Verified'}
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF7F0] border border-[#E4D9C7] p-4 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2.5">Pick-up Location</h3>
                <div className="flex items-center gap-3 text-xs text-[#05091B]">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center border border-[#3D4C27]/30 flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="block text-[#05091B]">{booking.car?.location || 'Central Station'}</strong>
                    <span className="text-[#64748B] text-[11px]">Complimentary key handover counter</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Timeline & Payment */}
            <div className="space-y-5">
              
              {/* Timeline */}
              <div className="bg-[#FAF7F0] border border-[#E4D9C7] p-5 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-4">Rental Duration</h3>
                
                <div className="relative border-l-2 border-[#E4D9C7] ml-3 pl-5 space-y-5">
                  <div className="relative">
                    <div className="absolute -left-[27px] w-3 h-3 bg-[#3D4C27] rounded-full ring-4 ring-[#FAF7F0]"></div>
                    <span className="text-[10px] font-bold text-[#3D4C27] uppercase tracking-wider">Pick-Up Date</span>
                    <p className="text-sm font-bold text-[#05091B] mt-0.5">{booking.pickupDate ? booking.pickupDate.split('T')[0] : 'N/A'}</p>
                    <p className="text-[11px] text-[#64748B]">10:00 AM (Standard)</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[27px] w-3 h-3 bg-[#64748B] rounded-full ring-4 ring-[#FAF7F0]"></div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Return Date</span>
                    <p className="text-sm font-bold text-[#05091B] mt-0.5">{booking.returnDate ? booking.returnDate.split('T')[0] : 'N/A'}</p>
                    <p className="text-[11px] text-[#64748B]">10:00 AM (Standard)</p>
                  </div>
                </div>
              </div>

              {/* Renter Info */}
              <div className="bg-[#FAF7F0] border border-[#E4D9C7] p-4 rounded-2xl text-xs space-y-1.5">
                <h3 className="font-bold uppercase tracking-wider text-[#64748B] mb-2">Renter Summary</h3>
                <p className="flex justify-between text-[#64748B]">
                  <span>Name:</span> 
                  <span className="font-bold text-[#05091B]">{user?.name}</span>
                </p>
                <p className="flex justify-between text-[#64748B]">
                  <span>Email:</span> 
                  <span className="font-bold text-[#05091B]">{user?.email}</span>
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-[#05091B] border border-[#10172B] p-5 rounded-2xl text-white shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8EA860] mb-3">Payment Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Base Rental Total</span>
                    <span className="font-bold text-white">{curr}{booking.price}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Payment Status</span>
                    <span className={`font-bold ${booking.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {booking.paymentStatus === 'paid' ? 'PAID' : 'PAY LATER (PENDING)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Insurance Coverage</span>
                    <span className="font-bold text-emerald-400">INCLUDED</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline text-white">
                    <span className="text-xs font-bold">Total Amount</span>
                    <span className="text-xl font-black text-[#8EA860]">{curr}{booking.price}</span>
                  </div>
                </div>

                {isUnpaid && (
                  <button
                    onClick={handlePayNow}
                    className="w-full mt-4 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    Pay {curr}{booking.price} Online
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

