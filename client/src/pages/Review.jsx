import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
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
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* Header Banner */}
      <div className="bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Reviews
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Read feedback from verified renters or share your own car rental experience.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-teal-400 font-bold text-xs bg-teal-500/10 border border-teal-500/20 px-3.5 py-1.5 rounded-xl">
              {reviewList.length} {reviewList.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Write a Review Card */}
        {user ? (
          !userHasReviewed ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Write a Review</h2>
              <p className="text-xs text-slate-500 mb-5">Share your feedback about your car rental with the community.</p>

              <form onSubmit={handleAddReview} className="space-y-4">
                
                {/* Rating Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <svg
                          className={`h-7 w-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-200'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {rating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Comments</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about the vehicle condition, pick-up process, and your journey..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-teal-50/60 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between text-teal-900">
              <p className="text-xs font-semibold">You have already submitted a customer review. Thank you for your feedback!</p>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Have you rented with us?</h3>
              <p className="text-xs text-slate-500 mt-0.5">Sign in to your account to leave a verified rating and review.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              Sign In to Review
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">All Reviews</h2>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-6 h-36 animate-pulse"></div>
              ))}
            </div>
          ) : reviewList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <p className="text-slate-500 text-sm font-medium">No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            reviewList.map((rev) => (
              <div
                key={rev._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-800 font-bold flex items-center justify-center text-sm uppercase">
                      {rev.user?.name ? rev.user.name.charAt(0) : 'R'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{rev.user?.name || 'Verified Customer'}</h3>
                      <p className="text-[11px] text-slate-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified Renter'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-amber-400">
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
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  {rev.comment}
                </p>

                {/* Delete Review button if current user owns it */}
                {user && (rev.user?._id === user._id || rev.user === user._id) && (
                  <div className="flex justify-end pt-3 border-t border-slate-100">
                    <button
                      onClick={() => deleteReview(rev._id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 inline-flex items-center gap-1.5 transition-colors"
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