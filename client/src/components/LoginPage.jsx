import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { GoogleLogin } from "@react-oauth/google";

const LoginPage = () => {
  const { axios, setToken, navigate } = useAppContext();

  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [role, setRole] = useState('user');

  const onSubmitHandler = async (event) => {
    try {
      event.preventDefault();
      const checkState = state === "login" 
        ? { email, password } 
        : role === "owner" 
          ? { name, email, password, role, phone_no: phoneNo } 
          : { name, email, password, role };
          
      const { data } = await axios.post(`/user/${state}`, checkState);

      if (data.success) {
        navigate("/");
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Google handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      const { data } = await axios.post("/user/google-login", { token });

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        toast.success("Google Login Success");
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative bg-white rounded-2xl shadow-xl flex flex-col md:flex-row w-[95%] sm:w-full max-w-4xl max-h-[92vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left image section - Desktop Only */}
        <div className="w-full md:w-1/2 hidden md:block">
          <img
            className="h-full w-full object-cover"
            src="https://plus.unsplash.com/premium_vector-1716902818044-90a5366a5962?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"
            alt="leftSideImage"
          />
        </div>

        {/* Right form section - Responsive Paddings */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 py-8 sm:p-8 md:p-10">
          <form
            className="w-full max-w-sm flex flex-col items-center justify-center"
            onSubmit={onSubmitHandler}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-gray-900 font-medium text-center">
              {state === "login" ? "Sign in" : "Sign up"}
            </h2>

            <p className="text-xs sm:text-sm text-gray-500/90 mt-2 sm:mt-3 text-center px-2">
              {state === "login"
                ? "Welcome back! Please sign in to continue"
                : "Create your account to get started"}
            </p>

            {/* Role Toggles */}
            {state === "register" && (
              <div className="mt-5 w-full flex gap-3">
                <button
                  type="button"
                  className={`w-1/2 h-11 rounded-full border text-sm font-medium transition ${
                    role === "user"
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                  onClick={() => setRole("user")}
                >
                  User
                </button>

                <button
                  type="button"
                  className={`w-1/2 h-11 rounded-full border text-sm font-medium transition ${
                    role === "owner"
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                  onClick={() => setRole("owner")}
                >
                  Owner
                </button>
              </div>
            )}

            {/* Name Input */}
            {state === "register" && (
              <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" fill="#6B7280" />
                  <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" fill="#6B7280" />
                </svg>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Name"
                  className="bg-transparent outline-none text-sm w-full h-full pr-4"
                  required
                />
              </div>
            )}

            {/* Email Input */}
            <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" className="flex-shrink-0">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z"
                  fill="#6B7280"
                />
              </svg>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email id"
                className="bg-transparent outline-none text-sm w-full h-full pr-4"
                required
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
              <svg width="13" height="17" viewBox="0 0 13 17" fill="none" className="flex-shrink-0">
                <path
                  d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
                  fill="#6B7280"
                />
              </svg>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder="Password"
                className="bg-transparent outline-none text-sm w-full h-full pr-4"
                required
              />
            </div>

            {/* Phone No Input (Fully Responsive) */}
            {state === "register" && role === "owner" && (
              <div className="flex items-center mt-4 w-full bg-transparent border border-gray-300/60 h-12 rounded-full overflow-hidden pl-5 gap-2 focus-within:border-indigo-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                  <path
                    d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.3 21 3 13.7 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z"
                    fill="#6B7280"
                  />
                </svg>
                <input
                  onChange={(e) => setPhoneNo(e.target.value)}
                  value={phoneNo}
                  type="tel"
                  placeholder="Phone No."
                  className="bg-transparent outline-none text-sm w-full h-full pr-4"
                  required
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full text-white bg-indigo-500 hover:opacity-90 transition-opacity text-sm font-medium shadow-sm"
            >
              {state === "login" ? "Login" : "Sign up"}
            </button>

            {/* Google Login Container */}
            <div className="w-full mt-4 flex justify-center">
              <div className="w-full max-w-[280px] sm:max-w-xs transition-transform duration-300 hover:scale-[1.01] flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  theme="outline"
                  size="large"
                  shape="pill"
                  logo_alignment="left"
                  width="100%" 
                />
              </div>
            </div>

            {/* Dynamic Bottom Toggle Link */}
            {state === "login" ? (
              <p className="text-gray-500/90 text-xs sm:text-sm mt-5 text-center">
                Don’t have an account?{" "}
                <span
                  className="text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer font-semibold ml-1"
                  onClick={() => setState("register")}
                >
                  Sign up
                </span>
              </p>
            ) : (
              <p className="text-gray-500/90 text-xs sm:text-sm mt-5 text-center">
                Already have an account?{" "}
                <span
                  className="text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer font-semibold ml-1"
                  onClick={() => setState("login")}
                >
                  Login
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

