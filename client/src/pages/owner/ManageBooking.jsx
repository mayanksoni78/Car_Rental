import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import PageHeader from '../../components/owner/PageHeader';
import toast from 'react-hot-toast';

const ManageBooking = () => {
  const { axios, currency } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchOwnerBooking = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/bookings/owner');
      if (data.success) {
        setBookings(data.booking || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const changeBookingStatus = async (bookingId, status) => {
    try {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b))
      );

      const { data } = await axios.post('/bookings/change-status', { bookingId, status });
      if (data.success) {
        toast.success(data.message || "Status updated");
        fetchOwnerBooking();
      } else {
        toast.error(data.message);
        fetchOwnerBooking();
      }
    } catch (error) {
      toast.error(error.message);
      fetchOwnerBooking();
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      const confirm = window.confirm('Are you sure you want to cancel this booking and release the vehicle inventory slot?');
      if (!confirm) return;

      const { data } = await axios.post('/bookings/delete-booking', { bookingId });
      if (data.success) {
        toast.success(data.message || "Booking cancelled and slot released");
        fetchOwnerBooking();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOwnerBooking();
  }, []);

  const filteredBookings = bookings.filter((b) => {
    const carName = `${b.car?.brand || ''} ${b.car?.model || ''}`.toLowerCase();
    const customerName = (b.user?.name || b.guestInfo?.name || '').toLowerCase();
    const bookingId = (b._id || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    const matchesSearch = carName.includes(term) || customerName.includes(term) || bookingId.includes(term);
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const statuses = ['All', 'pending', 'pending_payment', 'confirmed', 'active', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      <PageHeader
        showBack={true}
        backFallback="/owner"
        category="Reservations Queue"
        title="Bookings"
        description="Manage reservations, approve rental schedules, and review payment statuses."
        action={
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF7F0] border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B]">
            <span className="w-2 h-2 rounded-full bg-[#3D4C27]"></span>
            <span>{bookings.length} Total Reservations</span>
          </div>
        }
      />

      {/* Filters & Search Row */}
      <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by car, customer name, or booking ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-xs sm:text-sm font-semibold text-[#05091B] placeholder-stone-400 focus:outline-none focus:border-[#3D4C27]"
          />
          <svg className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-500 hidden sm:inline">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#F5F0E7] border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] focus:outline-none focus:border-[#3D4C27] cursor-pointer capitalize"
          >
            {statuses.map((st, i) => (
              <option key={i} value={st}>
                {st === 'All' ? 'All Statuses' : st.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Bookings Table (Desktop) / Cards (Mobile) */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 text-sm font-medium">
          Loading reservations...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center mx-auto">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#05091B]">No Bookings Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm || selectedStatus !== 'All' ? 'No bookings match your current filter criteria.' : 'Reservations will appear here once customers book your vehicles.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2ECE1] text-stone-600 uppercase text-[10px] font-extrabold tracking-wider border-b border-[#E4D9C7]">
                  <th className="py-4 px-5">Vehicle</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Schedule</th>
                  <th className="py-4 px-5">Amount</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-center">Manage</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E4D9C7] text-xs font-semibold">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-[#FFFDF9] transition-colors">
                    
                    {/* Vehicle */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={b.car?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200"}
                          alt="Car"
                          className="w-12 h-9 object-cover rounded-lg bg-white border border-[#E4D9C7] p-0.5 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-[#05091B]">
                            {b.car?.brand} {b.car?.model}
                          </p>
                          <span className="text-[10px] text-stone-500 font-medium">
                            {b.car?.category || 'Sedan'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-[#05091B]">{b.user?.name || b.guestInfo?.name || 'Customer'}</p>
                      <p className="text-[10px] text-stone-500 font-medium">{b.user?.email || b.guestInfo?.email || 'N/A'}</p>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-5">
                      <p className="font-bold text-[#05091B]">
                        {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} - {b.returnDate ? new Date(b.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {b.createdAt ? `Booked ${new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-5">
                      <span className="font-black text-[#05091B]">
                        {currency}{b.price?.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        b.paymentStatus === 'paid'
                          ? 'bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {b.paymentStatus || (b.paymentType === 'pay_later' ? 'Pay Later' : 'Pending')}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-5">
                      <select
                        value={b.status}
                        onChange={(e) => changeBookingStatus(b._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer ${
                          b.status === 'confirmed' || b.status === 'completed' || b.status === 'active'
                            ? 'bg-[#EBF0E4] text-[#3D4C27] border-[#3D4C27]/40'
                            : b.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active Trip</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => deleteBooking(b._id)}
                        title="Cancel & Release"
                        className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (sm/md screens) */}
          <div className="lg:hidden space-y-4">
            {filteredBookings.map((b) => (
              <div
                key={b._id}
                className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl p-4 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E4D9C7]">
                  <div className="flex items-center gap-3">
                    <img
                      src={b.car?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200"}
                      alt="Car"
                      className="w-12 h-9 object-cover rounded-lg bg-white border border-[#E4D9C7] p-0.5"
                    />
                    <div>
                      <p className="font-bold text-[#05091B] text-sm">
                        {b.car?.brand} {b.car?.model}
                      </p>
                      <p className="text-xs text-stone-500">
                        {b.user?.name || b.guestInfo?.name || 'Customer'}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-black text-[#05091B]">
                    {currency}{b.price?.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Schedule</span>
                    <span className="font-bold text-[#05091B]">
                      {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} - {b.returnDate ? new Date(b.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 font-semibold block text-[10px] uppercase">Payment</span>
                    <span className="font-bold text-[#05091B] uppercase">
                      {b.paymentStatus || (b.paymentType === 'pay_later' ? 'Pay Later' : 'Pending')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <select
                    value={b.status}
                    onChange={(e) => changeBookingStatus(b._id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border bg-[#F5F0E7] border-[#E4D9C7] text-[#05091B] cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active Trip</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => deleteBooking(b._id)}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default ManageBooking;
