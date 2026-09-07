import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Testimonial = () => {
  const { axios, user } = useAppContext();
  const navigate = useNavigate();
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get('/review/get-review');
        if (data.success && data.reviews) {
          setReviewsList(data.reviews);
        }
      } catch (error) {
        console.error("Error loading reviews:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [axios]);

  return (
    <section className="py-20 bg-[#F5F0E7] border-t border-[#E4D9C7] relative overflow-hidden" id="reviews-section">
      {/* Subtle ambient blur */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#3D4C27]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF0E4] border border-[#3D4C27]/20 text-[#3D4C27] text-xs font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D4C27]"></span>
            Client Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#05091B] tracking-tight">
            Verified Rental Experiences
          </h2>
          <p className="text-stone-600 text-sm mt-2">
            Discover authentic reviews from travelers and clients who booked their journey with us.
          </p>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#FAF7F0] p-7 rounded-3xl border border-[#E4D9C7] animate-pulse h-48"></div>
            ))}
          </div>
        ) : reviewsList && reviewsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewsList.slice(0, 6).map((rev) => (
              <div 
                key={rev._id}
                className="bg-[#FAF7F0] p-7 rounded-3xl border border-[#E4D9C7] hover:border-[#3D4C27]/40 hover:shadow-md hover:shadow-[#3D4C27]/5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Row: Stars + Quote Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-[#D89A35]">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`h-4 w-4 ${i < rev.rating ? 'text-[#D89A35] fill-[#D89A35]' : 'text-[#E4D9C7] fill-[#E4D9C7]'}`} 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <span className="text-[#3D4C27]/20 group-hover:text-[#3D4C27]/40 transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-stone-800 text-sm leading-relaxed mb-6 font-medium">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Customer Details */}
                <div className="pt-4 border-t border-[#E4D9C7] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#EBF0E4] border border-[#3D4C27]/30 text-[#3D4C27] font-black flex items-center justify-center text-xs uppercase shadow-xs">
                      {rev.user?.name ? rev.user.name.charAt(0) : 'R'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#05091B] truncate">
                        {rev.user?.name || 'Verified Renter'}
                      </p>
                      <p className="text-[10px] text-stone-500 font-medium">
                        {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3D4C27] bg-[#EBF0E4] px-2 py-0.5 rounded-md border border-[#3D4C27]/20">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-8 max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-[#EBF0E4] text-[#3D4C27] rounded-2xl flex items-center justify-center mx-auto border border-[#3D4C27]/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#05091B]">No Reviews Yet</h3>
              <p className="text-stone-600 text-xs mt-1">
                Be the first to share your car rental experience with our community.
              </p>
            </div>
            <button 
              onClick={() => navigate(user ? "/reviews" : "/login")}
              className="px-6 py-2.5 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl shadow-md shadow-[#3D4C27]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Write First Review &rarr;
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonial;