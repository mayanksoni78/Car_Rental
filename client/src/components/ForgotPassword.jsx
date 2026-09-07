import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import BackButton from './BackButton';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post('/user/forgot-password', { email });
      if (data.success) {
        toast.success(data.message || 'Reset link sent to your email.');
      } else {
        toast.error(data.message || 'Failed to send reset link.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F0E7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mb-4">
        <BackButton fallback="/login" />
      </div>

      <div className="max-w-md w-full space-y-6 bg-[#FAF7F0] p-8 sm:p-10 rounded-3xl border border-[#E4D9C7] shadow-xs">
        <div className="text-center">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#3D4C27] bg-[#EBF0E4] px-2.5 py-0.5 rounded-md border border-[#3D4C27]/20">Account Security</span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-[#05091B]">
            Forgot Password
          </h2>
          <p className="mt-1.5 text-xs text-[#64748B]">
            Enter your registered email address and we will send you a password reset link.
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmitHandler}>
          <div>
            <label htmlFor="email-address" className="block text-xs font-bold text-[#64748B] mb-1">
              Email Address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-2.5 bg-[#F5F0E7] border border-[#E4D9C7] text-xs text-[#05091B] rounded-xl focus:outline-none focus:border-[#3D4C27] transition-colors placeholder-[#94A3B8]"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 bg-[#3D4C27] hover:bg-[#4C5E31] text-[#FAF7F0] text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>
          
          <div className="text-center pt-2">
            <span 
              onClick={() => navigate('/login')} 
              className="text-xs font-bold text-[#64748B] hover:text-[#05091B] hover:underline cursor-pointer"
            >
              Back to Sign In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
