import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import PageHeader from '../../components/owner/PageHeader';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { axios, isOwner, currency, navigate } = useAppContext();

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    completeBookings: 0,
    pendingBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/owner/dashboard');
      if (data.success) {
        setData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchDashboardData();
    }
  }, [isOwner]);

  const dashboardCards = [
    {
      title: "Total Cars",
      value: data.totalCars,
      change: "Active in inventory",
      icon: (
        <svg className="w-5 h-5 text-[#3D4C27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: "Total Bookings",
      value: data.totalBookings,
      change: "Lifetime reservations",
      icon: (
        <svg className="w-5 h-5 text-[#3D4C27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Confirmed Trips",
      value: data.completeBookings,
      change: "Active & completed",
      icon: (
        <svg className="w-5 h-5 text-[#3D4C27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Pending Requests",
      value: data.pendingBookings,
      change: "Awaiting confirmation",
      icon: (
        <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        category="Operations & Analytics"
        title="Owner Dashboard"
        description="Real-time overview of your vehicle inventory, active bookings, and monthly revenue."
        action={
          <button
            onClick={() => navigate('/owner/add-car')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Vehicle
          </button>
        }
      />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl p-5 flex flex-col justify-between shadow-xs hover:border-[#3D4C27]/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                {card.title}
              </span>
              <div className="w-10 h-10 rounded-xl bg-[#EBF0E4] border border-[#3D4C27]/20 flex items-center justify-center">
                {card.icon}
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-black text-[#05091B] tracking-tight">
                {card.value}
              </span>
              <p className="text-[11px] font-semibold text-stone-500 mt-1">
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Bookings & Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Bookings (2 cols) */}
        <div className="lg:col-span-2 bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E4D9C7]">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#05091B] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3D4C27]"></span>
                Recent Reservations
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Latest customer booking requests and statuses</p>
            </div>

            <button
              onClick={() => navigate('/owner/manage-booking-car')}
              className="text-xs font-bold text-[#3D4C27] hover:underline transition-colors cursor-pointer"
            >
              View All &rarr;
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-stone-400 text-sm">
              Loading reservations...
            </div>
          ) : data.recentBookings.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-sm font-medium">
              No recent reservations found.
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.map((booking, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#F5F0E7] border border-[#E4D9C7] rounded-2xl gap-3 hover:border-[#3D4C27]/40 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={booking.car?.image || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=200"}
                      alt="Car"
                      className="w-14 h-11 object-cover rounded-xl bg-white border border-[#E4D9C7] p-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="font-bold text-[#05091B] text-sm">
                        {booking.car?.brand} {booking.car?.model}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {booking.pickupDate ? `${new Date(booking.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(booking.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Upcoming'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-sm font-black text-[#05091B]">
                      {currency}{booking.price?.toLocaleString('en-IN')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                      booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'active'
                        ? 'bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30'
                        : booking.status === 'cancelled'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {booking.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Monthly Revenue & Shortcuts (1 col) */}
        <div className="space-y-6">
          
          {/* Revenue Card - Deep Midnight Navy */}
          <div className="bg-[#05091B] text-white border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2 text-[#8EA860] mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Monthly Revenue</span>
            </div>

            <p className="text-xs text-slate-400">Total revenue generated this month</p>
            <p className="text-3xl sm:text-4xl font-black text-white mt-2">
              {currency}{data.monthlyRevenue?.toLocaleString('en-IN') || 0}
            </p>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <span>Payout Schedule</span>
              <span className="font-bold text-[#8EA860]">Bi-Weekly (Direct)</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#05091B] uppercase tracking-wider">
              Quick Shortcuts
            </h3>
            <button
              onClick={() => navigate('/owner/manage-car')}
              className="w-full py-3 px-4 bg-[#F5F0E7] hover:bg-white border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Manage Fleet Vehicles</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => navigate('/owner/manage-booking-car')}
              className="w-full py-3 px-4 bg-[#F5F0E7] hover:bg-white border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Booking Approvals</span>
              <span>&rarr;</span>
            </button>
            <button
              onClick={() => navigate('/owner/profile')}
              className="w-full py-3 px-4 bg-[#F5F0E7] hover:bg-white border border-[#E4D9C7] rounded-xl text-xs font-bold text-[#05091B] flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Owner Profile Settings</span>
              <span>&rarr;</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
