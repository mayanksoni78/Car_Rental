import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MyBooking = () => {
  const { axios, user, currency } = useAppContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const { data } = await axios.get('/bookings/user');
        if (data.success && data.booking) {
          setBookings(data.booking);
        } else if (data.message) {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyBookings();
  }, [user?._id, axios]);

  const today = new Date();

  const categorizedBookings = {
    upcoming: bookings.filter(b => new Date(b.pickupDate) > today && b.status !== 'cancelled'),
    active: bookings.filter(b => new Date(b.pickupDate) <= today && new Date(b.returnDate) >= today && b.status !== 'cancelled'),
    completed: bookings.filter(b => new Date(b.returnDate) < today && b.status !== 'cancelled'),
    cancelled: bookings.filter(b => b.status === 'cancelled')
  };

  const currentBookings = categorizedBookings[activeTab] || [];

  const handleDownloadPDF = async (bookingId) => {
    if (!bookingId) {
      toast.error("Invalid booking ID");
      return;
    }

    try {
      toast.loading("Generating PDF invoice...", { id: `pdf-${bookingId}` });
      const response = await axios.get(`/bookings/${bookingId}/receipt`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CarRental_Invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Invoice downloaded!", { id: `pdf-${bookingId}` });
    } catch (err) {
      console.error("Error downloading invoice:", err);
      toast.error("Failed to download invoice PDF.", { id: `pdf-${bookingId}` });
    }
  };

  const handlePayNow = async (bookingId) => {
    try {
      toast.loading("Initiating payment gateway...", { id: `pay-${bookingId}` });
      const { data } = await axios.post(`/bookings/${bookingId}/pay-order`);

      if (!data.success || !data.order) {
        throw new Error(data.message || "Failed to initiate payment");
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay Client Key is missing in environment");
      }

      toast.dismiss(`pay-${bookingId}`);

      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Car Rental",
        description: `Settle booking for ${data.booking?.car?.brand || 'Car'}`,
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "verify-pay" });
            const verifyRes = await axios.post(`/bookings/${bookingId}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              toast.success("Payment verified! Booking confirmed.", { id: "verify-pay" });
              // Refresh bookings
              const refreshed = await axios.get('/bookings/user');
              if (refreshed.data.success) setBookings(refreshed.data.booking);
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
      toast.error(err.response?.data?.message || err.message || "Payment failed", { id: `pay-${bookingId}` });
      if (err.response?.status === 409) {
        // Refresh bookings if cancelled by server
        const refreshed = await axios.get('/bookings/user');
        if (refreshed.data.success) setBookings(refreshed.data.booking);
      }
    }
  };

  const getDeadlineText = (booking) => {
    if (booking.status === 'cancelled') {
      if (booking.cancellationReason?.includes('deadline') || booking.cancelledBy === 'system') {
        return 'Payment deadline expired • Cancelled';
      }
      return 'Cancelled';
    }

    if (booking.paymentStatus === 'paid') {
      return null;
    }

    if (booking.paymentDeadline) {
      const d = new Date(booking.paymentDeadline);
      return `Pay by ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} to keep booking`;
    }

    // Default fallback: day before pickup
    const pickup = new Date(booking.pickupDate);
    pickup.setDate(pickup.getDate() - 1);
    return `Pay by ${pickup.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} to keep booking`;
  };

  return (
    <div className="min-h-screen bg-[#F5F0E7] pb-20">
      
      {/* Header */}
      <div className="bg-[#05091B] text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-[#10172B]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                My Bookings
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Manage your reservations and download invoices.
              </p>
            </div>

            <button 
              onClick={() => navigate('/cars')}
              className="self-start sm:self-auto px-4 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Car
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Tab Navigation */}
        <div className="bg-[#FAF7F0] rounded-2xl border border-[#E4D9C7] p-1.5 mb-5 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {['upcoming', 'active', 'completed', 'cancelled'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-bold capitalize transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-[#05091B] text-white shadow-xs' 
                    : 'text-[#64748B] hover:text-[#05091B] hover:bg-[#F5F0E7]'
                }`}
              >
                {tab}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === tab 
                    ? 'bg-[#3D4C27] text-[#FAF7F0]' 
                    : 'bg-[#F5F0E7] text-[#64748B]'
                }`}>
                  {categorizedBookings[tab].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#FAF7F0] rounded-2xl border border-[#E4D9C7] p-6 h-36 animate-pulse"></div>
            ))}
          </div>
        ) : currentBookings.length > 0 ? (
          <div className="space-y-4">
            {currentBookings.map((booking) => {
              const deadlineMsg = getDeadlineText(booking);
              const isUnpaidPayLater = booking.paymentStatus !== 'paid' && booking.status !== 'cancelled';

              return (
                <div 
                  key={booking._id} 
                  className="bg-[#FAF7F0] rounded-2xl border border-[#E4D9C7] p-5 hover:border-[#3D4C27] transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                    
                    {/* Car Thumbnail & Info */}
                    <div className="flex gap-3.5 items-center lg:w-1/3">
                      <img 
                        src={booking.car?.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop"} 
                        alt={booking.car?.brand} 
                        className="w-20 h-16 sm:w-24 sm:h-20 object-contain rounded-xl bg-[#F5F0E7] border border-[#E4D9C7] p-1.5" 
                      />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${
                            activeTab === 'active' ? 'bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30' :
                            activeTab === 'upcoming' ? 'bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30' :
                            activeTab === 'completed' ? 'bg-[#E8EDF5] text-[#1E3A8A] border border-blue-200' :
                            'bg-red-50 text-[#DC4C4C] border border-red-200'
                          }`}>
                            {activeTab}
                          </span>
                          <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase ${
                            booking.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.paymentStatus === 'paid' ? 'PAID' : 'PAY LATER'}
                          </span>
                        </div>
                        <h3 className="font-bold text-[#05091B] text-sm sm:text-base leading-tight">
                          {booking.car?.brand} {booking.car?.model}
                        </h3>
                        <p className="text-[11px] text-[#64748B] mt-0.5">{booking.car?.year || '2024'} • {booking.car?.category || 'Standard'}</p>
                        
                        {deadlineMsg && (
                          <p className={`text-[10px] font-bold mt-1.5 ${
                            booking.status === 'cancelled' ? 'text-[#DC4C4C]' : 'text-[#D89A35]'
                          }`}>
                            {deadlineMsg}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Schedule Timeline */}
                    <div className="w-full lg:w-5/12 bg-[#F5F0E7] p-3.5 rounded-xl border border-[#E4D9C7]">
                      <div className="flex items-center justify-between gap-3">
                        
                        {/* Pick-up */}
                        <div>
                          <p className="text-[9px] font-bold text-[#64748B] uppercase">Pick-Up</p>
                          <p className="text-xs font-bold text-[#111827] mt-0.5">
                            {new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>

                        {/* Duration Tag */}
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-[#3D4C27] bg-[#EBF0E4] border border-[#3D4C27]/30 px-2 py-0.5 rounded-md">
                            {Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)))} Days
                          </span>
                          <div className="w-12 h-0.5 bg-[#E4D9C7] mt-1"></div>
                        </div>

                        {/* Return */}
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-[#64748B] uppercase">Return</p>
                          <p className="text-xs font-bold text-[#111827] mt-0.5">
                            {new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* Price & Action Buttons */}
                    <div className="w-full lg:w-1/4 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E4D9C7]">
                      <div className="text-left lg:text-right">
                        <p className="text-[9px] font-bold text-[#64748B] uppercase">Total</p>
                        <p className="text-lg font-black text-[#3D4C27]">{currency || '₹'}{booking.price}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {isUnpaidPayLater && (
                          <button 
                            onClick={() => handlePayNow(booking._id)}
                            className="px-3 py-1.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black rounded-xl transition-all shadow-sm cursor-pointer"
                          >
                            Pay Online
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/booking/${booking._id}`)}
                          className="px-3.5 py-1.5 bg-[#05091B] hover:bg-[#3D4C27] hover:text-[#FAF7F0] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Details
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(booking._id)}
                          className="px-3 py-1.5 bg-[#F5F0E7] hover:bg-[#FAF7F0] border border-[#E4D9C7] text-[#05091B] text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#3D4C27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Invoice
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-[#FAF7F0] rounded-2xl p-10 text-center border border-[#E4D9C7] max-w-md mx-auto">
            <h3 className="text-sm font-bold text-[#05091B] mb-1 capitalize">No {activeTab} bookings</h3>
            <p className="text-[#64748B] text-xs mb-4">You have no reservations under this status.</p>
            <button 
              onClick={() => navigate('/cars')}
              className="px-5 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Browse Cars
            </button>
          </div>
        )}


      </div>
    </div>
  );
};

export default MyBooking;