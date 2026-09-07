import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
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
        navigate("/");
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative bg-[#FAF7F0] border border-[#E4D9C7] rounded-3xl shadow-2xl flex flex-col md:flex-row w-[95%] sm:w-full max-w-4xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left image section - Desktop Only */}
        <div className="w-full md:w-1/2 hidden md:block bg-[#05091B] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8EA860]">Car Rental Platform</span>
            <h3 className="text-2xl font-black text-white mt-1">Premium Mobility, Simplified.</h3>
          </div>
          <img
            className="w-full h-64 object-contain my-auto drop-shadow-xl relative z-10"
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop"
            alt="Car Showcase"
          />
          <p className="text-slate-400 text-xs relative z-10">Verified vehicles, secure instant reservations, and transparent pricing.</p>
        </div>

        {/* Right form section */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 py-8 sm:p-10">
          <form
            className="w-full max-w-sm flex flex-col items-center justify-center"
            onSubmit={onSubmitHandler}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl sm:text-3xl font-black text-[#05091B] text-center">
              {state === "login" ? "Sign In" : "Create Account"}
            </h2>

            <p className="text-xs text-[#64748B] mt-1.5 text-center">
              {state === "login"
                ? "Enter your credentials to access your bookings"
                : "Sign up to start renting or listing vehicles"}
            </p>

            {/* Role Toggles */}
            {state === "register" && (
              <div className="mt-4 w-full flex gap-2 bg-[#F5F0E7] p-1 rounded-xl border border-[#E4D9C7]">
                <button
                  type="button"
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "user"
                      ? "bg-[#05091B] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#05091B]"
                  }`}
                  onClick={() => setRole("user")}
                >
                  Customer
                </button>

                <button
                  type="button"
                  className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    role === "owner"
                      ? "bg-[#05091B] text-white shadow-xs"
                      : "text-[#64748B] hover:text-[#05091B]"
                  }`}
                  onClick={() => setRole("owner")}
                >
                  Car Owner
                </button>
              </div>
            )}

            {/* Name Input */}
            {state === "register" && (
              <div className="flex items-center mt-3.5 w-full bg-[#F5F0E7] border border-[#E4D9C7] h-11 rounded-xl overflow-hidden pl-4 gap-2 focus-within:border-[#3D4C27] transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-[#64748B]">
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="currentColor" />
                  <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" fill="currentColor" />
                </svg>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Full Name"
                  className="bg-transparent outline-none text-xs text-[#05091B] w-full h-full pr-3"
                  required
                />
              </div>
            )}

            {/* Email Input */}
            <div className="flex items-center mt-3.5 w-full bg-[#F5F0E7] border border-[#E4D9C7] h-11 rounded-xl overflow-hidden pl-4 gap-2 focus-within:border-[#3D4C27] transition-colors">
              <svg width="15" height="11" viewBox="0 0 16 11" fill="none" className="flex-shrink-0 text-[#64748B]">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                  fill="currentColor"
                />
              </svg>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email Address"
                className="bg-transparent outline-none text-xs text-[#05091B] w-full h-full pr-3"
                required
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center mt-3.5 w-full bg-[#F5F0E7] border border-[#E4D9C7] h-11 rounded-xl overflow-hidden pl-4 gap-2 focus-within:border-[#3D4C27] transition-colors">
              <svg width="13" height="15" viewBox="0 0 13 17" fill="none" className="flex-shrink-0 text-[#64748B]">
                <path
                  d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                  fill="currentColor"
                />
              </svg>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                className="bg-transparent outline-none text-xs text-[#05091B] w-full h-full pr-3"
                required
              />
            </div>

            {/* Phone No Input */}
            {state === "register" && role === "owner" && (
              <div className="flex items-center mt-3.5 w-full bg-[#F5F0E7] border border-[#E4D9C7] h-11 rounded-xl overflow-hidden pl-4 gap-2 focus-within:border-[#3D4C27] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-[#64748B]">
                  <path
                    d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  onChange={(e) => setPhoneNo(e.target.value)}
                  value={phoneNo}
                  type="tel"
                  placeholder="Phone Number"
                  className="bg-transparent outline-none text-xs text-[#05091B] w-full h-full pr-3"
                  required
                />
              </div>
            )}

            {/* Forgot Password Link */}
            {state === "login" && (
              <div className="w-full flex justify-end mt-2">
                <span 
                  onClick={() => navigate('/forgot-password')} 
                  className="text-xs text-[#64748B] hover:text-[#05091B] font-semibold hover:underline cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-5 w-full h-11 rounded-xl text-[#FAF7F0] bg-[#3D4C27] hover:bg-[#4C5E31] font-black uppercase tracking-wider transition-all text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {state === "login" ? "Sign In" : "Register"}
            </button>

            {/* Google Login Container */}
            <div className="w-full mt-4 flex flex-col items-center">
              <div className="flex items-center w-full my-1.5">
                <div className="flex-grow border-t border-[#E4D9C7]"></div>
                <span className="px-2.5 text-[10px] font-bold text-[#64748B] uppercase">OR</span>
                <div className="flex-grow border-t border-[#E4D9C7]"></div>
              </div>
              <div className="w-full max-w-[280px] sm:max-w-xs transition-transform duration-300 hover:scale-[1.01] flex justify-center mt-1">
                <div type="button" onClick={(e) => e.stopPropagation()}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Login Failed")}
                    theme="outline"
                    size="large"
                    shape="pill"
                    logo_alignment="left"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Bottom Toggle Link */}
            {state === "login" ? (
              <p className="text-[#64748B] text-xs mt-4 text-center">
                Don’t have an account?{" "}
                <span
                  className="text-[#05091B] font-black hover:text-[#3D4C27] hover:underline cursor-pointer ml-1"
                  onClick={() => setState("register")}
                >
                  Sign up
                </span>
              </p>
            ) : (
              <p className="text-[#64748B] text-xs mt-4 text-center">
                Already have an account?{" "}
                <span
                  className="text-[#05091B] font-black hover:text-[#3D4C27] hover:underline cursor-pointer ml-1"
                  onClick={() => setState("login")}
                >
                  Sign in
                </span>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

