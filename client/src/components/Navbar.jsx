import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, isOwner, setShowLogin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navlinks = [
    { name: "Home", path: "/" },
    { name: "Cars", path: "/cars" },
    { name: "My Bookings", path: "/my-booking" },
    { name: "Reviews", path: "/reviews" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#05091B] border-b border-[#4A5D31]/80 text-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => navigate("/")} 
          className="cursor-pointer select-none py-1 flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#3D4C27] flex items-center justify-center text-[#FAF7F0] font-black shadow-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Car<span className="text-[#8EA860]">Rental</span>
          </span>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {navlinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-bold tracking-wide transition-colors duration-200 relative py-1 ${
                isActive(link.path) 
                  ? 'text-[#8EA860]' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8EA860] rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action / Profile Icon */}
        <div className="flex items-center gap-3">
          
          {user ? (
            /* Simple Circular Profile Icon */
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-[#10172B] border border-slate-700/80 hover:border-[#8EA860] transition-all flex items-center justify-center p-0.5 shadow-sm focus:outline-none relative group cursor-pointer"
                aria-label="User menu"
              >
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || "User"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#3D4C27] to-[#5C6E3D] text-[#FAF7F0] font-black flex items-center justify-center text-sm uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
                {/* Active indicator */}
                <span className="w-2.5 h-2.5 rounded-full bg-[#8EA860] border-2 border-[#05091B] absolute bottom-0 right-0"></span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl shadow-xl p-3 text-[#05091B] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* User Card Header */}
                  <div className="p-3 bg-[#F5F0E7] rounded-xl border border-[#E4D9C7] mb-2 shadow-2xs">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#3D4C27]/30 shadow-2xs" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#3D4C27] text-[#FAF7F0] font-black flex items-center justify-center text-sm uppercase shadow-2xs">
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-extrabold text-[#05091B] truncate">{user.name}</p>
                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#E4D9C7] flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-500">Account Type</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#3D4C27] text-[#FAF7F0]">
                        {isOwner ? 'Car Owner' : 'Verified Renter'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-0.5">
                    <Link 
                      to="/my-booking" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#05091B] hover:bg-[#F5F0E7] hover:text-[#3D4C27] rounded-xl transition-all duration-150 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center group-hover:bg-[#3D4C27] group-hover:text-[#FAF7F0] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span>My Bookings</span>
                    </Link>

                    <Link 
                      to="/cars" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#05091B] hover:bg-[#F5F0E7] hover:text-[#3D4C27] rounded-xl transition-all duration-150 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EBF0E4] text-[#3D4C27] flex items-center justify-center group-hover:bg-[#3D4C27] group-hover:text-[#FAF7F0] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <span>Explore All Cars</span>
                    </Link>

                    {isOwner && (
                      <Link 
                        to="/owner" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-bold text-[#3D4C27] bg-[#EBF0E4]/60 hover:bg-[#EBF0E4] rounded-xl transition-all duration-150 group border border-[#3D4C27]/20"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#3D4C27] text-[#FAF7F0] flex items-center justify-center shadow-2xs">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                        <span>Owner Dashboard</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 mt-1 border-t border-[#E4D9C7]">
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }} 
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-100/70 flex items-center justify-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* Logged-Out CTA */
            <button 
              onClick={() => setShowLogin(true)} 
              className="px-5 py-2 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-[#3D4C27]/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#05091B] px-4 py-4 space-y-2 animate-in fade-in duration-150">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/') ? 'text-[#8EA860] bg-[#10172B]' : 'text-slate-300'}`}
          >
            Home
          </Link>
          <Link 
            to="/cars" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/cars') ? 'text-[#8EA860] bg-[#10172B]' : 'text-slate-300'}`}
          >
            Explore Cars
          </Link>
          <Link 
            to="/my-booking" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/my-booking') ? 'text-[#8EA860] bg-[#10172B]' : 'text-slate-300'}`}
          >
            My Bookings
          </Link>
          <Link 
            to="/reviews" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/reviews') ? 'text-[#8EA860] bg-[#10172B]' : 'text-slate-300'}`}
          >
            Reviews
          </Link>
          {isOwner && (
            <Link 
              to="/owner" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#8EA860] bg-[#3D4C27]/20"
            >
              Owner Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
