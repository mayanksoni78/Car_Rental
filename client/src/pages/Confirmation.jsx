import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';

const Confirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { axios, user, currency } = useAppContext();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const { data } = await axios.get('/bookings/user');
        if (data.success && data.booking) {
          const found = data.booking.find(b => b._id === bookingId);
          if (found) {
            setBooking(found);
          } else {
            // If list doesn't have it right away or booking was just created
            const latest = data.booking[0];
            if (latest && (latest._id === bookingId || !bookingId)) {
              setBooking(latest);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId, axios, user]);

  const handleDownloadReceipt = async () => {
    const targetId = booking?._id || bookingId;
    if (!targetId) {
      toast.error("No valid booking ID to fetch receipt");
      return;
    }

    try {
      toast.loading("Generating PDF receipt...", { id: "receipt-download" });
      const response = await axios.get(`/bookings/${targetId}/receipt`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CarRental_Booking_${targetId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Receipt downloaded successfully!", { id: "receipt-download" });
    } catch (err) {
      console.error("Error downloading receipt:", err);
      toast.error("Failed to download official receipt PDF.", { id: "receipt-download" });
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

  return (
    <div className="min-h-screen bg-[#F5F0E7] text-[#111827] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full mb-4">
        <BackButton fallback="/my-booking" />
      </div>

      <div className="max-w-xl w-full bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Top Hero Banner */}
        <div className="bg-[#05091B] p-8 text-center border-b border-[#10172B] relative overflow-hidden text-white">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#3D4C27]/30 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-16 h-16 bg-[#3D4C27]/40 text-[#8EA860] border border-[#3D4C27] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8EA860]">Confirmed</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Booking Confirmed</h1>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Your vehicle is reserved and ready for pickup.
          </p>
        </div>

        {/* Details Content */}
        <div className="p-6 space-y-5">
          <div className="bg-[#F5F0E7] rounded-2xl p-5 border border-[#E4D9C7] space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-[#64748B] font-medium">Booking ID</span>
              <span className="font-mono font-bold text-[#05091B] bg-[#FAF7F0] px-2.5 py-0.5 rounded-lg border border-[#E4D9C7]">
                {booking?._id || bookingId}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[#64748B] font-medium">Status</span>
              <span className="font-bold px-2.5 py-0.5 rounded-lg text-xs uppercase bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30">
                {booking?.status || 'Confirmed'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#64748B] font-medium">Payment Status</span>
              {booking?.paymentStatus?.toLowerCase() === 'paid' ? (
                <span className="font-bold px-2.5 py-0.5 rounded-lg text-xs uppercase bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3D4C27]"></span>
                  PAID (Online)
                </span>
              ) : (
                <span className="font-bold px-2.5 py-0.5 rounded-lg text-xs uppercase bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  PENDING (Pay at Pick-up)
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[#64748B] font-medium">Amount</span>
              <span className="font-black text-[#05091B] text-base">{curr}{booking?.price || booking?.totalAmount || '0'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-[#64748B] font-medium">Dates</span>
              <span className="font-semibold text-[#111827]">
                {booking?.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : 'Today'} - {booking?.returnDate ? new Date(booking.returnDate).toLocaleDateString() : 'Return'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button 
              onClick={handleDownloadReceipt}
              className="flex-1 py-3 px-4 bg-[#F5F0E7] hover:bg-[#FAF7F0] border border-[#E4D9C7] text-[#05091B] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 text-[#3D4C27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Receipt
            </button>
            <button 
              onClick={() => navigate('/my-booking')}
              className="flex-1 py-3 px-4 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-md shadow-[#3D4C27]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              My Bookings
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Confirmation;

