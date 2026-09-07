import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Confirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { axios, user } = useAppContext();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (bookingId === 'confirmed') {
          // If we don't have a real booking ID yet (mocked or from a specific flow), just simulate it
          setBooking({
            _id: 'BKG-' + Math.floor(Math.random() * 1000000),
            paymentStatus: 'PAID', // we might not know exactly, but assume paid for mocked
            pickupDate: new Date().toISOString(),
            returnDate: new Date().toISOString(),
            totalAmount: 0,
            status: 'Confirmed'
          });
          setLoading(false);
          return;
        }

        const { data } = await axios.get('/bookings/my-bookings');
        if (data.success) {
          const found = data.bookings.find(b => b._id === bookingId);
          if (found) {
            setBooking(found);
          } else {
            toast.error("Booking not found");
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

  const handleDownloadReceipt = () => {
    // In a real app, this would call a backend endpoint that generates a PDF.
    toast.success("Downloading receipt...");
    // Simulate download
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob([`Receipt for Booking ${booking?._id}\nTotal: $${booking?.totalAmount}\nStatus: ${booking?.paymentStatus}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Receipt-${booking?._id}.txt`;
      document.body.appendChild(element);
      element.click();
    }, 1000);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-8 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fa-solid fa-check text-4xl text-teal-600"></i>
          </div>
          <h1 className="text-3xl font-black mb-2">Booking Confirmed!</h1>
          <p className="text-teal-100">Thank you for choosing Car Rental. Your reservation is complete.</p>
        </div>

        <div className="p-8">
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Booking Details</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Booking ID</span>
                <span className="font-mono font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded">{booking?._id || bookingId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Status</span>
                <span className={`font-bold px-3 py-1 rounded-full text-xs ${booking?.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {booking?.paymentStatus || 'PENDING'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Amount</span>
                <span className="font-bold text-gray-800">${booking?.totalAmount || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Rental Dates</span>
                <span className="font-medium text-gray-800">
                  {booking?.pickupDate ? new Date(booking.pickupDate).toLocaleDateString() : 'N/A'} - {booking?.returnDate ? new Date(booking.returnDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleDownloadReceipt}
              className="flex-1 bg-white border-2 border-teal-600 text-teal-600 font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-download"></i>
              Download Receipt
            </button>
            <button 
              onClick={() => navigate('/my-booking')}
              className="flex-1 bg-teal-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/30 transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-car"></i>
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
