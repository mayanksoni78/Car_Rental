import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import Sidebar from '../../components/owner/Sidebar';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
  const { isOwner } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isOwner) {
      navigate('/');
    }
  }, [isOwner, navigate]);

  const mobileNavLinks = [
    { name: "Dashboard", path: "/owner", exact: true },
    { name: "My Cars", path: "/owner/manage-car" },
    { name: "Add Car", path: "/owner/add-car" },
    { name: "Bookings", path: "/owner/manage-booking-car" },
    { name: "Profile", path: "/owner/profile" },
  ];

  const checkIsActive = (link) => {
    if (link.exact) return location.pathname === link.path;
    return location.pathname.startsWith(link.path);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F5F0E7] text-[#05091B] flex flex-col font-sans">
      
      {/* Mobile Owner Sub-Nav Bar (md:hidden) */}
      <div className="md:hidden bg-[#05091B] border-b border-[#1E293B]/80 px-4 py-3 flex items-center justify-between sticky top-18 z-40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#8EA860]"></span>
          <span className="text-xs font-black uppercase tracking-wider text-white">Owner Workspace</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-3 py-1.5 bg-[#10172B] hover:bg-[#1A233A] border border-slate-700 text-xs font-bold text-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <span>Menu</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05091B] border-b border-[#1E293B] px-4 py-3 space-y-1 z-40">
          {mobileNavLinks.map((link, idx) => {
            const active = checkIsActive(link);
            return (
              <NavLink
                key={idx}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#3D4C27] text-[#FAF7F0]'
                    : 'text-slate-300 hover:text-white hover:bg-[#10172B]'
                }`}
              >
                {link.name}
              </NavLink>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 min-w-0">
        {/* Desktop Sticky Sidebar */}
        <div className="hidden md:block md:sticky md:top-18 md:h-[calc(100vh-72px)] flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Owner Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
