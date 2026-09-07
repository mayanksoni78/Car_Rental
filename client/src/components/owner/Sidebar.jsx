import React from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Sidebar = () => {
  const { user, logout } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const ownerMenuLinks = [
    {
      name: "Dashboard",
      path: "/owner",
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: "My Cars",
      path: "/owner/manage-car",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: "Add Car",
      path: "/owner/add-car",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: "Bookings",
      path: "/owner/manage-booking-car",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      name: "Profile",
      path: "/owner/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  const checkIsActive = (link) => {
    if (link.exact) {
      return location.pathname === link.path;
    }
    return location.pathname.startsWith(link.path);
  };

  return (
    <aside className="w-64 bg-[#05091B] border-r border-[#1E293B]/70 flex flex-col justify-between p-4 sm:p-5 flex-shrink-0 select-none text-white md:min-h-[calc(100vh-72px)]">
      
      <div className="space-y-6">
        
        {/* Profile Card Header */}
        <div 
          onClick={() => navigate('/owner/profile')}
          className="p-3.5 bg-[#10172B] rounded-2xl border border-slate-800/80 flex items-center gap-3 cursor-pointer hover:border-[#3D4C27] transition-all group"
        >
          <div className="relative w-11 h-11 rounded-xl bg-[#05091B] border border-slate-700/80 p-0.5 flex-shrink-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "Owner"}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-lg bg-[#3D4C27] text-[#FAF7F0] font-black text-base flex items-center justify-center uppercase">
                {user?.name ? user.name.charAt(0) : 'O'}
              </div>
            )}
            <span className="w-2.5 h-2.5 rounded-full bg-[#8EA860] border border-[#05091B] absolute -bottom-0.5 -right-0.5"></span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate group-hover:text-[#8EA860] transition-colors">
              {user?.name || "Owner"}
            </p>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#8EA860]">
              Owner Console
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 mb-2">
            Operations
          </p>

          {ownerMenuLinks.map((link, index) => {
            const active = checkIsActive(link);
            return (
              <NavLink
                key={index}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#3D4C27] text-[#FAF7F0] shadow-sm shadow-[#3D4C27]/40"
                    : "text-slate-300 hover:text-white hover:bg-[#10172B]/80"
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${active ? "text-[#FAF7F0]" : "text-slate-400"}`}>
                  {link.icon}
                </div>
                <span className="tracking-wide">{link.name}</span>
              </NavLink>
            );
          })}
        </div>

      </div>

      {/* Bottom Nav / Utility Links */}
      <div className="pt-5 mt-6 border-t border-slate-800/80 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10172B] transition-all cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span>Customer View</span>
        </button>

        <button
          onClick={() => navigate("/my-booking")}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#10172B] transition-all cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span>My Bookings</span>
        </button>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#DC4C4C] hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer text-left"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[#DC4C4C]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
