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

  const handleDownloadPDF = (bookingId) => {
    toast.success("Downloading PDF invoice...");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([`Invoice for Booking #${bookingId}\nCar Rental Service\nStatus: Paid`], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `Invoice-${bookingId}.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Clean Header */}
      <div className="bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Bookings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              View your car reservations and download invoices.
            </p>
          </div>

          <button 
            onClick={() => navigate('/cars')}
            className="self-start sm:self-auto px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book a Car
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-1.5 mb-6 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {['upcoming', 'active', 'completed', 'cancelled'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] py-2.5 px-4 text-xs font-bold capitalize transition-all rounded-xl flex items-center justify-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === tab 
                    ? 'bg-teal-400 text-slate-950' 
                    : 'bg-slate-100 text-slate-600'
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
              <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-40 animate-pulse"></div>
            ))}
          </div>
        ) : currentBookings.length > 0 ? (
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <div 
                key={booking._id} 
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  
                  {/* Car Thumbnail & Info */}
                  <div className="flex gap-4 items-center lg:w-1/3">
                    <img 
                      src={booking.car?.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop"} 
                      alt={booking.car?.brand} 
                      className="w-24 h-20 sm:w-28 sm:h-24 object-contain rounded-xl bg-slate-50 border border-slate-100 p-2" 
                    />
                    <div>
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md mb-1.5 ${
                        activeTab === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        activeTab === 'upcoming' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                        activeTab === 'completed' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {activeTab}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-tight">
                        {booking.car?.brand} {booking.car?.model}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{booking.car?.year || '2024'} • {booking.car?.category || 'Standard'}</p>
                      <p className="text-[11px] text-teal-600 font-semibold mt-1">Ref #{booking._id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  {/* Schedule Timeline */}
                  <div className="w-full lg:w-5/12 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Pick-up */}
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pick-Up</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {/* Duration Tag */}
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-md">
                          {Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)))} Days
                        </span>
                        <div className="w-16 h-0.5 bg-slate-200 mt-1.5"></div>
                      </div>

                      {/* Return */}
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Return</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="w-full lg:w-1/4 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</p>
                      <p className="text-xl font-extrabold text-slate-900">{currency || '₹'}{booking.price}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/booking/${booking._id}`)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(booking._id)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Invoice
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl p-14 text-center border border-slate-200/80 shadow-2xs max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1 capitalize">No {activeTab} bookings</h3>
            <p className="text-slate-500 text-xs mb-6">You currently have no reservations under this tab.</p>
            <button 
              onClick={() => navigate('/cars')}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Browse Available Cars
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBooking;