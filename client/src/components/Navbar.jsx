import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user, logout, isOwner } = useAppContext();
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
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo - Far Left */}
        <div 
          onClick={() => navigate("/")} 
          className="cursor-pointer select-none py-1"
        >
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Car<span className="text-teal-400">Rental</span>
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
                  ? 'text-teal-400' 
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Action / Profile Icon - Far Right */}
        <div className="flex items-center gap-3">
          
          {user ? (
            /* Simple Circular Profile Icon */
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700/80 hover:border-teal-500/60 transition-all flex items-center justify-center p-0.5 shadow-sm focus:outline-none relative group"
                aria-label="User menu"
              >
                {user.image ? (
                  <img 
                    src={user.image} 
                    alt={user.name || "User"} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
                {/* Active indicator */}
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 absolute bottom-0 right-0"></span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-2 text-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  
                  {/* User Card Header */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-2">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-10 h-10 rounded-full object-cover ring-1 ring-teal-500/40" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-inner uppercase">
                          {user.name ? user.name.charAt(0) : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Status</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
                        {isOwner ? 'Vehicle Owner' : 'Verified Renter'}
                      </span>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1">
                    <Link 
                      to="/my-booking" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      My Bookings
                    </Link>

                    <Link 
                      to="/cars" 
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Browse All Cars
                    </Link>

                    {isOwner && (
                      <Link 
                        to="/owner" 
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Owner Dashboard
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-2 mt-1 border-t border-slate-800">
                    <button 
                      onClick={() => { setProfileOpen(false); logout(); }} 
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            /* Logged-Out CTA */
            <button 
              onClick={() => navigate("/login")} 
              className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-all duration-200 shadow-md shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-4 space-y-2 animate-in fade-in duration-150">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/') ? 'text-teal-400 bg-slate-900' : 'text-slate-300'}`}
          >
            Home
          </Link>
          <Link 
            to="/cars" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/cars') ? 'text-teal-400 bg-slate-900' : 'text-slate-300'}`}
          >
            Explore Cars
          </Link>
          <Link 
            to="/my-booking" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/my-booking') ? 'text-teal-400 bg-slate-900' : 'text-slate-300'}`}
          >
            My Bookings
          </Link>
          <Link 
            to="/reviews" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-xl text-sm font-semibold ${isActive('/reviews') ? 'text-teal-400 bg-slate-900' : 'text-slate-300'}`}
          >
            Reviews
          </Link>
          {isOwner && (
            <Link 
              to="/owner" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10"
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
