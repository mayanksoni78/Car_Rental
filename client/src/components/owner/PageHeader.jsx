import React from 'react';
import BackButton from '../BackButton';

const PageHeader = ({ category = "Management", title, description, action, showBack = false, backFallback = '/owner' }) => {
  return (
    <div className="space-y-4 mb-8 pb-6 border-b border-[#E4D9C7]">
      {showBack && (
        <div>
          <BackButton fallback={backFallback} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {category && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3D4C27]"></span>
              {category}
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-black text-[#05091B] tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
