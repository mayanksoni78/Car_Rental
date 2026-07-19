import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./context/AppContext.jsx";
import "./index.css";
import {HashRouter } from "react-router-dom";
import {MotionConfig} from 'motion/react'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
     <GoogleOAuthProvider clientId="592454877102-fscmhtkdg62ci4tubhcoi3tnnnfji982.apps.googleusercontent.com">
      <HashRouter>
       <AppProvider>
        <MotionConfig viewport={{once:true}}>
         <App />
        </MotionConfig>
      </AppProvider>
     </HashRouter>
   </GoogleOAuthProvider>
  </React.StrictMode>
);
