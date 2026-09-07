import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 pb-12 border-b border-slate-800/80">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div 
              onClick={() => {
                navigate("/");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer select-none mb-4 inline-block"
            >
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Car<span className="text-teal-400">Rental</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Simple, reliable car rentals for your journey. Book quality vehicles directly with verified owners, transparent rates, and zero hidden charges.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-teal-400 transition-colors">
                  Browse Fleet
                </Link>
              </li>
              <li>
                <Link to="/my-booking" className="hover:text-teal-400 transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-teal-400 transition-colors">
                  Customer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>car_rental@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 96444 80966</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-4 text-xs">
              <Link to="/about-us" className="text-slate-400 hover:text-white transition-colors">
                About Us
              </Link>
              <span className="text-slate-700">•</span>
              <Link to="/contact-us" className="text-slate-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Car Rental. All rights reserved.</p>
          <p className="text-slate-600">Built for seamless journeys & trusted rentals.</p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
