import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, isOwner, navigate } = useAppContext();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock notifications for now, will come from backend later
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your booking #1234 is confirmed.", read: false },
    { id: 2, message: "Payment for booking #1234 was successful.", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (!notificationsOpen) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const navlink = [
    { name: "Home", path: "/" },
    { name: "Cars", path: "/cars" },
    { name: "MyBooking", path: "/my-booking" },
  ];

  return (
    <div className="sticky top-0 z-50">
      <nav className="bg-[#0d4b50] text-white shadow-md px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between relative">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src="https://images.hdqwalls.com/download/car-minimalism-simple-art-1920x1080.jpg" alt="Car Rental Logo" className="h-6 w-6 sm:w-10 sm:h-10 rounded-md object-cover cursor-pointer hover:scale-105 transition-transform duration-300" />
          <p className="text-[10px] sm:text-lg font-semibold tracking-wide font-['Outfit'] text-white hover:text-[#fdf9b3] transition-colors duration-200">Car Rental</p>
        </div>

        <div className="flex items-center text-[8px] sm:text-base sm:gap-4 md:gap-6">
          {navlink.map((link) => (
            <div key={link.name} className="nav-item">
              <Link to={link.path} className="text-[#f3eee5] font-medium hover:text-[#0d4b50] transition-colors duration-300 px-3 py-2 rounded-md hover:bg-[#f1ecd5]">{link.name}</Link>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <button onClick={toggleNotifications} className="p-2 relative text-white hover:text-[#fdf9b3] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-2 text-black z-50">
                <div className="px-4 py-2 font-semibold border-b">Notifications</div>
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div key={notification.id} className="px-4 py-3 border-b hover:bg-gray-50 text-sm">
                      <p className={notification.read ? "text-gray-600" : "text-black font-semibold"}>{notification.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <button
              onClick={() => navigate("/owner")}
              className="px-1 sm:px-4 py-1.5 sm:py-2 bg-[#f5ebd4] text-[#0d4b50] text-[8.5px] sm:text-base font-semibold rounded-md hover:bg-[#ebd8b0] border-[#083a3f] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">Dashboard</button>
          )}
          <button onClick={() => { user ? logout() : navigate("/login") }} className="px-1 sm:px-4 py-1.5 sm:py-2 bg-[#f5ebd4] text-[#0d4b50] text-[8.5px] sm:text-base font-semibold rounded-md hover:bg-[#ebd8b0] border-[#083a3f] shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"> {user ? 'Logout' : 'Login'}</button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
