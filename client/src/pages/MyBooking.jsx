import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import Title from '../components/Title';
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
        if (data.success) {
          setBookings(data.booking);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyBookings();
  }, [user, axios]);

  const today = new Date();

  // Derived statuses (assuming basic data structure)
  const categorizedBookings = {
    upcoming: bookings.filter(b => new Date(b.pickupDate) > today && b.status !== 'cancelled'),
    active: bookings.filter(b => new Date(b.pickupDate) <= today && new Date(b.returnDate) >= today && b.status !== 'cancelled'),
    completed: bookings.filter(b => new Date(b.returnDate) < today && b.status !== 'cancelled'),
    cancelled: bookings.filter(b => b.status === 'cancelled')
  };

  const currentBookings = categorizedBookings[activeTab] || [];

  const handleDownloadPDF = (bookingId) => {
    toast.success("Downloading PDF receipt...");
    // Simulate PDF download
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([`Receipt for Booking ${bookingId}`], { type: 'application/pdf' });
      element.href = URL.createObjectURL(file);
      element.download = `Booking-${bookingId}.pdf`;
      document.body.appendChild(element);
      element.click();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-teal-900 py-12 px-4 sm:px-6 md:px-10 text-center text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">My Bookings</h1>
        <p className="text-teal-100 max-w-2xl mx-auto">Manage your profile and track all your car rental history</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-8">
        
        {/* Profile Card */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-2xl font-bold uppercase">
                {user.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">License Status:</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    user.drivingLicenseStatus === 'Verified' ? 'bg-green-100 text-green-700' :
                    user.drivingLicenseStatus === 'Verification Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {user.drivingLicenseStatus || 'Not Verified'}
                  </span>
                </div>
              </div>
            </div>
            
            {(!user.drivingLicenseStatus || user.drivingLicenseStatus === 'Not Verified' || user.drivingLicenseStatus === 'Rejected' || user.drivingLicenseStatus === 'Expired') && (
              <button 
                onClick={() => window.location.href = `${axios.defaults.baseURL}/api/license/verify/start?userId=${user._id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
              >
                Verify License Now
              </button>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex border-b overflow-x-auto hide-scrollbar">
            {['upcoming', 'active', 'completed', 'cancelled'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[120px] py-4 px-6 text-sm font-bold capitalize transition-all border-b-2 ${
                  activeTab === tab 
                    ? 'border-teal-600 text-teal-600 bg-teal-50/50' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                  {categorizedBookings[tab].length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : currentBookings.length > 0 ? (
          <div className="space-y-6">
            {currentBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Car Image & Basic Info */}
                  <div className="flex gap-4 lg:w-1/3">
                    <img src={booking.car?.image} alt={booking.car?.brand} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl bg-gray-50" />
                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                          activeTab === 'active' ? 'bg-green-100 text-green-700' :
                          activeTab === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          activeTab === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {activeTab}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{booking.car?.brand} {booking.car?.model}</h3>
                      <p className="text-xs text-gray-500">{booking.car?.year} • {booking.car?.category}</p>
                      <p className="text-xs font-medium text-teal-700 mt-2">ID: {booking._id}</p>
                    </div>
                  </div>

                  {/* Timeline (Pickup / Return) */}
                  <div className="flex-1 border-y lg:border-y-0 lg:border-x border-gray-100 py-4 lg:py-0 lg:px-6 flex flex-col justify-center">
                    <div className="relative flex items-center justify-between before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:w-full before:h-0.5 before:bg-gray-100 before:z-0">
                      
                      <div className="relative z-10 bg-white pr-4">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-2 mx-auto ring-4 ring-white">
                          <i className="fa-solid fa-map-pin text-xs"></i>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Pickup</p>
                          <p className="text-sm font-bold text-gray-800">{new Date(booking.pickupDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="relative z-10 bg-white px-2">
                        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-full border border-teal-100">
                          {Math.max(1, Math.ceil((new Date(booking.returnDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)))} Days
                        </span>
                      </div>

                      <div className="relative z-10 bg-white pl-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 mx-auto ring-4 ring-white">
                          <i className="fa-solid fa-flag-checkered text-xs"></i>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 font-medium">Return</p>
                          <p className="text-sm font-bold text-gray-800">{new Date(booking.returnDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                    </div>
                    <div className="text-center mt-4 text-sm text-gray-600">
                      <i className="fa-solid fa-location-dot text-red-500 mr-2"></i>
                      {booking.car?.location}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="lg:w-1/4 flex flex-row lg:flex-col justify-between items-center lg:items-end gap-4">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-teal-700">{currency}{booking.price}</p>
                      <p className="text-[10px] text-gray-400 mt-1">Booked: {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button 
                        onClick={() => navigate(`/booking/${booking._id}`)}
                        className="w-full bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700 transition shadow-sm"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(booking._id)}
                        className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition shadow-sm flex items-center justify-center gap-2"
                      >
                        <i className="fa-regular fa-file-pdf text-red-500"></i>
                        Invoice
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <i className="fa-solid fa-car-side text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeTab} bookings found</h3>
            <p className="text-gray-500 mb-6">Looks like you don't have any bookings in this category.</p>
            <button 
              onClick={() => navigate('/cars')}
              className="bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition"
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