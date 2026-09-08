import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = ({ onClose }) => {
  const { axios, setToken, setUser, setIsOwner, navigate } = useAppContext();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      setLoading(true);
      const checkState = state === "login" 
        ? { email, password } 
        : role === "owner" 
          ? { name, email, password, role, phone_no: phoneNo } 
          : { name, email, password, role };
          
      const { data } = await axios.post(`/user/${state}`, checkState);

      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          setUser(data.user);
          setIsOwner(data.user.role === 'owner');
        }
        setToken(data.token);
        toast.success(data.message || (state === "login" ? "Login successful" : "Registration successful"));
        // In modal mode: close modal and stay on current page
        // In standalone /login route mode: navigate home
        if (onClose) {
          onClose();
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || "Authentication failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Google handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const token = credentialResponse.credential;
      const { data } = await axios.post("/user/google-login", { token });

      if (data.success) {
        localStorage.setItem("token", data.token);
        if (data.user) {
          setUser(data.user);
          setIsOwner(data.user.role === 'owner');
        }
        setToken(data.token);
        toast.success(data.message || "Google Login Success");
        navigate("/");
      } else {
        toast.error(data.message || "Google Login failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={onClose || undefined}
    >
      <div
        className="relative bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl shadow-2xl flex flex-col md:flex-row w-[95%] sm:w-full max-w-4xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* X Close Button — always visible */}
        <button
          onClick={onClose || (() => navigate(-1))}
          aria-label="Close"
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E7] border border-[#E4D9C7] text-[#64748B] hover:bg-[#E4D9C7] hover:text-[#05091B] transition-all cursor-pointer shadow-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left image section - Desktop Only */}
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center overflow-hidden bg-[#FAF7F0]">
          <img
            className="w-full h-full min-h-[500px] object-cover"
            src="/car-illustration.jpg"
            alt="Car Illustration"
          />
        </div>

        {/* Right form section */}
        <div className="w-full md:w-1/2 flex flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
          {/* Top Switcher Tabs (Login / Sign up) */}
          <div className="flex items-center justify-end gap-6 text-xs font-semibold pb-4">
            <button
              type="button"
              onClick={() => setState("login")}
              className={`pb-1 cursor-pointer transition-all ${
                state === "login"
                  ? "text-[#3D4C27] font-bold border-b-2 border-[#3D4C27]"
                  : "text-[#94A3B8] hover:text-[#05091B]"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setState("register")}
              className={`pb-1 cursor-pointer transition-all ${
                state === "register"
                  ? "text-[#3D4C27] font-bold border-b-2 border-[#3D4C27]"
                  : "text-[#94A3B8] hover:text-[#05091B]"
              }`}
            >
              Sign up
            </button>
          </div>

          <form
            className="w-full max-w-sm mx-auto flex flex-col justify-center flex-1 my-auto"
            onSubmit={onSubmitHandler}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3D4C27] tracking-tight">
                {state === "login" ? "Welcome back" : "Create Account"}
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                {state === "login" ? "Please login to your account" : "Please register your account"}
              </p>
            </div>

            {/* Role Switcher (Customer / Car Owner) */}
            {state === "register" && (
              <div className="mb-4 w-full flex gap-2 bg-[#F5F0E7] p-1 rounded-xl border border-[#E4D9C7]">
                <button
                  type="button"
                  className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "user"
                      ? "bg-[#3D4C27] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#05091B]"
                  }`}
                  onClick={() => setRole("user")}
                >
                  Customer
                </button>
                <button
                  type="button"
                  className={`w-1/2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "owner"
                      ? "bg-[#3D4C27] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#05091B]"
                  }`}
                  onClick={() => setRole("owner")}
                >
                  Car Owner
                </button>
              </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
              {state === "register" && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    User Name
                  </label>
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    type="text"
                    placeholder="Your name"
                    className="w-full pb-2 pt-1 border-b border-[#E4D9C7] focus:border-[#3D4C27] outline-none text-xs text-[#05091B] bg-transparent transition-colors placeholder-[#CBD5E1]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                  Email
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pb-2 pt-1 border-b border-[#E4D9C7] focus:border-[#3D4C27] outline-none text-xs text-[#05091B] bg-transparent transition-colors placeholder-[#CBD5E1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                  Pass Word
                </label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pb-2 pt-1 border-b border-[#E4D9C7] focus:border-[#3D4C27] outline-none text-xs text-[#05091B] bg-transparent transition-colors placeholder-[#CBD5E1]"
                  required
                />
              </div>

              {state === "register" && role === "owner" && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#94A3B8] mb-1">
                    Phone Number
                  </label>
                  <input
                    onChange={(e) => setPhoneNo(e.target.value)}
                    value={phoneNo}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full pb-2 pt-1 border-b border-[#E4D9C7] focus:border-[#3D4C27] outline-none text-xs text-[#05091B] bg-transparent transition-colors placeholder-[#CBD5E1]"
                    required
                  />
                </div>
              )}

              {/* Forgot? Link */}
              {state === "login" && (
                <div className="flex justify-end pt-1">
                  <span
                    onClick={() => navigate('/forgot-password')}
                    className="text-xs text-[#64748B] hover:text-[#3D4C27] cursor-pointer transition-colors"
                  >
                    Forgot?
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-6 w-full h-11 rounded-xl text-white bg-[#3D4C27] hover:bg-[#4C5E31] font-bold text-xs tracking-wider transition-all shadow-md shadow-[#3D4C27]/20 flex items-center justify-center gap-2 cursor-pointer ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {state === "login" ? "Login" : "Sign Up"}
            </button>

            {/* Google Sign-in */}
            <div className="w-full mt-5 flex flex-col items-center">
              <div className="flex items-center w-full mb-3">
                <div className="flex-grow border-t border-[#E4D9C7]"></div>
                <span className="px-2.5 text-[10px] text-[#94A3B8] uppercase">OR</span>
                <div className="flex-grow border-t border-[#E4D9C7]"></div>
              </div>
              <div className="w-full max-w-[280px] sm:max-w-xs flex justify-center">
                <div type="button" onClick={(e) => e.stopPropagation()}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Login Failed")}
                    theme="outline"
                    size="medium"
                    shape="pill"
                    logo_alignment="left"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

