import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Review = () => {
  const { reviews, setReviews, axios, user } = useAppContext();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const getReview = async () => {
    try {
      const { data } = await axios.get("/review/get-review");
      if (data.success && data.reviews) {
        setReviews(data.reviews);
      } else if (data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error loading reviews:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to write a review");
      navigate("/login");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter your review comments");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post("/review/add-review", { rating, comment });
      if (data.success) {
        toast.success("Review posted successfully!");
        setComment('');
        setRating(5);
        getReview();
      } else {
        toast.error(data.message || "Failed to post review");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const confirm = window.confirm('Are you sure you want to delete this review?');
      if (!confirm) return;

      const { data } = await axios.post("/review/delete-review", { reviewId });
      if (data.success) {
        toast.success(data.message || "Review deleted");
        getReview();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getReview();
  }, []);

  const reviewList = Array.isArray(reviews) ? reviews : [];
  const userHasReviewed = user && reviewList.some(r => r?.user?._id === user._id || r?.user === user._id);

  return (
    <div className="min-h-screen bg-[#F5F0E7] pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#05091B] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-[#10172B] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#3D4C27]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Customer Reviews & Ratings
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl">
              Authentic feedback and rental journey impressions shared by verified renters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#FAF7F0] font-black text-xs bg-[#3D4C27] border border-[#8EA860]/30 px-4 py-2 rounded-xl shadow-sm">
              {reviewList.length} {reviewList.length === 1 ? 'Review' : 'Total Reviews'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Write a Review Card */}
        {user ? (
          !userHasReviewed ? (
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-[#E4D9C7] pb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3D4C27] bg-[#EBF0E4] px-2.5 py-0.5 rounded-md border border-[#3D4C27]/20">
                  Share Your Experience
                </span>
                <h2 className="text-xl font-black text-[#05091B] mt-2">Write a Verified Review</h2>
                <p className="text-xs text-stone-600 mt-0.5">Tell other renters about your vehicle condition, pick-up ease, and driving experience.</p>
              </div>

              <form onSubmit={handleAddReview} className="space-y-6">
                
                {/* Rating Picker */}
                <div>
                  <label className="block text-xs font-extrabold text-[#05091B] uppercase tracking-wider mb-2.5">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-115 cursor-pointer"
                      >
                        <svg
                          className={`h-7 w-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'text-[#D89A35] fill-[#D89A35]'
                              : 'text-[#E4D9C7] fill-[#E4D9C7]'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs font-black text-[#3D4C27] bg-[#EBF0E4] px-2.5 py-1 rounded-lg border border-[#3D4C27]/20 ml-2">
                      {rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-extrabold text-[#05091B] uppercase tracking-wider mb-2">
                    Review Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe the vehicle condition, pick-up process, and cleanliness..."
                    className="w-full bg-[#F5F0E7] border border-[#E4D9C7] rounded-2xl p-4 text-xs sm:text-sm text-[#05091B] font-medium placeholder-stone-400 focus:outline-none focus:border-[#3D4C27] focus:bg-white transition-all shadow-inner"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-3 bg-[#3D4C27] hover:bg-[#4C5E31] disabled:opacity-50 text-[#FAF7F0] font-black text-xs rounded-xl shadow-md shadow-[#3D4C27]/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Post Verified Review'}
                    <span>&rarr;</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#FAF7F0] border border-[#E4D9C7] rounded-2xl p-5 flex items-center justify-between text-[#05091B] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EBF0E4] text-[#3D4C27] border border-[#3D4C27]/30 flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-[#05091B]">You have shared your customer review.</p>
                  <p className="text-[11px] text-stone-500">Thank you for contributing to the community!</p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xs">
            <div>
              <h3 className="font-black text-[#05091B] text-base">Have you recently rented a vehicle?</h3>
              <p className="text-xs text-stone-600 mt-1">Sign in to your account to share your verified review and rating.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] font-black text-xs rounded-xl transition-all shadow-md shadow-[#3D4C27]/20 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Sign In to Review &rarr;
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#05091B]">Verified Reviews ({reviewList.length})</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 h-36 animate-pulse"></div>
              ))}
            </div>
          ) : reviewList.length === 0 ? (
            <div className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-12 text-center space-y-2">
              <p className="text-stone-700 text-sm font-bold">No customer reviews yet.</p>
              <p className="text-stone-500 text-xs">Be the first to share your rental experience!</p>
            </div>
          ) : (
            reviewList.map((rev) => (
              <div
                key={rev._id}
                className="bg-[#FAF7F0] rounded-3xl border border-[#E4D9C7] p-6 sm:p-7 shadow-xs hover:border-[#3D4C27]/40 hover:shadow-md hover:shadow-[#3D4C27]/5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#EBF0E4] border border-[#3D4C27]/30 text-[#3D4C27] font-black flex items-center justify-center text-sm uppercase shadow-xs">
                      {rev.user?.name ? rev.user.name.charAt(0) : 'R'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#05091B] text-sm">{rev.user?.name || 'Verified Customer'}</h3>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Renter'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
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
                </div>

                <p className="text-stone-800 text-sm leading-relaxed mb-4 font-medium">
                  "{rev.comment}"
                </p>

                {/* Delete Review button if current user owns it */}
                {user && (rev.user?._id === user._id || rev.user === user._id) && (
                  <div className="flex justify-end pt-3 border-t border-[#E4D9C7]">
                    <button
                      onClick={() => deleteReview(rev._id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete my review
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default Review;