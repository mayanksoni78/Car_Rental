import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { axios, user, currency } = useAppContext();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (user) {
      fetchBooking();
    }
  }, [bookingId, axios, user, navigate]);

  const handleDownloadPDF = () => {
    toast.success("Downloading Invoice...");
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([`Invoice for Booking ${booking?._id}\nAmount: ${currency}${booking?.price}`], {type: 'application/pdf'});
      element.href = URL.createObjectURL(file);
      element.download = `Invoice-${booking?._id}.pdf`;
      document.body.appendChild(element);
      element.click();
    }, 1000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/my-booking')} className="flex items-center gap-2 text-gray-500 hover:text-teal-700 font-semibold mb-6 transition">
          <i className="fa-solid fa-arrow-left"></i>
          Back to My Bookings
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-teal-900 p-6 sm:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Booking Details</h1>
              <p className="text-teal-200 font-mono text-sm">Booking ID: {booking._id}</p>
            </div>
            <div className="flex gap-3">
              <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                booking.status === 'confirmed' ? 'bg-green-500 text-white' : 
                booking.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {booking.status.toUpperCase()}
              </span>
              <button onClick={handleDownloadPDF} className="bg-white text-teal-900 px-4 py-2 rounded-lg font-bold hover:bg-teal-50 transition shadow-lg flex items-center gap-2">
                <i className="fa-solid fa-download"></i>
                Invoice
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-10 grid md:grid-cols-2 gap-10">
            {/* Left Column: Car Info */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Vehicle Information</h3>
                <img src={booking.car?.image} alt={booking.car?.brand} className="w-full h-48 object-cover rounded-xl bg-gray-50 mb-4" />
                <h4 className="text-xl font-bold text-gray-800">{booking.car?.brand} {booking.car?.model}</h4>
                <p className="text-gray-500">{booking.car?.year} • {booking.car?.category}</p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                  <div className="bg-gray-50 p-3 rounded-lg"><i className="fa-solid fa-gas-pump text-teal-600 mr-2"></i>{booking.car?.fuel_type}</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><i className="fa-solid fa-gear text-teal-600 mr-2"></i>{booking.car?.transmission}</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><i className="fa-solid fa-user-group text-teal-600 mr-2"></i>{booking.car?.seating_capacity} Seats</div>
                  <div className="bg-gray-50 p-3 rounded-lg"><i className="fa-solid fa-hashtag text-teal-600 mr-2"></i>{booking.car?.number}</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Location</h3>
                <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl text-sm">
                  <i className="fa-solid fa-location-dot text-red-500 text-lg mt-1"></i>
                  <div>
                    <p className="font-bold text-gray-800">Pickup & Drop-off</p>
                    <p className="text-gray-600">{booking.car?.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Rental Details & Summary */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Rental Period</h3>
                <div className="relative border-l-2 border-teal-200 ml-4 pl-6 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[35px] w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pickup</p>
                    <p className="text-lg font-bold text-gray-800">{new Date(booking.pickupDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">10:00 AM</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[35px] w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow"></div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Return</p>
                    <p className="text-lg font-bold text-gray-800">{new Date(booking.returnDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">10:00 AM</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Customer Details</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold text-gray-800 w-24 inline-block">Name:</span> {user.name}</p>
                  <p><span className="font-semibold text-gray-800 w-24 inline-block">Email:</span> {user.email}</p>
                  <p><span className="font-semibold text-gray-800 w-24 inline-block">License:</span> <span className="text-green-600 font-semibold">{user.drivingLicenseStatus}</span></p>
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
                <h3 className="text-lg font-bold text-teal-900 mb-4">Payment Summary</h3>
                <div className="space-y-3 text-sm text-teal-800">
                  <div className="flex justify-between">
                    <span>Base Rate</span>
                    <span className="font-semibold">{currency}{booking.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span className="font-semibold">{currency}0</span>
                  </div>
                  <hr className="border-teal-200" />
                  <div className="flex justify-between text-xl font-black text-teal-900">
                    <span>Total Paid</span>
                    <span>{currency}{booking.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
