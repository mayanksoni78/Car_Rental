import React from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'

const Navbarowner = () => {
  const { user } = useAppContext();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-3.5 bg-slate-950 border-b border-slate-800/80 shadow-sm sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
          <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <span className="font-black text-white text-lg tracking-tight group-hover:text-teal-400 transition-colors">
            Car<span className="text-teal-400">Rental</span>
          </span>
          <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-md">
            Owner Console
          </span>
        </div>
      </Link>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <p className="text-slate-200 text-xs sm:text-sm font-semibold">
            {user?.name || "Owner"}
          </p>
        </div>
      </div>
    </header>
  )
}

export default Navbarowner;
