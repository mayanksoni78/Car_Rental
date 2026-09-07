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
    <section className="py-20 bg-slate-50 border-t border-slate-200/70" id="reviews-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-4">
          <div>
            <span className="inline-block text-teal-600 font-bold text-xs uppercase tracking-widest bg-teal-50 border border-teal-200/60 px-3 py-1 rounded-lg mb-3">
              Verified Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Real experiences from people who rented with us.
            </p>
          </div>

          <button
            onClick={() => navigate("/reviews")}
            className="self-start sm:self-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 animate-pulse h-48"></div>
            ))}
          </div>
        ) : reviewsList && reviewsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviewsList.slice(0, 6).map((rev) => (
              <div 
                key={rev._id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`h-4 w-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} 
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Customer Details */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/60 text-teal-800 font-bold flex items-center justify-center text-xs uppercase">
                    {rev.user?.name ? rev.user.name.charAt(0) : 'R'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {rev.user?.name || 'Verified Customer'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 max-w-xl mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Customer Experiences</h3>
            <p className="text-slate-500 text-sm mb-6">
              Reviews from our renters will appear here. Be the first to share your rental experience!
            </p>
            <button 
              onClick={() => navigate(user ? "/reviews" : "/login")}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
            >
              Leave First Review
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Testimonial;