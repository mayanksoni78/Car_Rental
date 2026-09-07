import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton = ({
  fallback = '/',
  label = 'Back',
  className = '',
  variant = 'default'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e) => {
    e.preventDefault();
    // Check if there is history in the current session
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else if (fallback) {
      navigate(fallback);
    } else {
      navigate('/');
    }
  };

  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label={`Go back to previous page`}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer shadow-2xs select-none ${
        isDark
          ? 'bg-[#10172B] hover:bg-[#1A2540] text-slate-300 hover:text-white border border-slate-700/80 hover:border-[#8EA860]/40'
          : 'bg-[#FAF7F0] hover:bg-white text-[#05091B] hover:text-[#3D4C27] border border-[#E4D9C7] hover:border-[#3D4C27]/40 hover:shadow-xs'
      } ${className}`}
    >
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-1 ${
          isDark ? 'text-[#8EA860]' : 'text-[#3D4C27]'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
