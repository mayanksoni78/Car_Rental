import React from 'react'

const Title = ({ title, subTitle, align }) => {
  return (
    <div className={`space-y-2 ${align === 'left' ? 'text-left' : 'text-center'}`}>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#05091B] tracking-tight">{title}</h2>
      {subTitle && (
        <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">{subTitle}</p>
      )}
    </div>
  )
}

export default Title