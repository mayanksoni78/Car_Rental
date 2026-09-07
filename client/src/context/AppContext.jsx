import { useContext , createContext } from "react";
import axios from "axios";
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { useState,useEffect  } from "react";

axios.defaults.baseURL =import.meta.env.VITE_BASE_URL || "http://localhost:2005";

export const AppContext=createContext();

export const AppProvider=({children})=>{

  const navigate =useNavigate();
  const currency = import.meta.env.VITE_CURRENCY
 
  const [token,setToken]=useState(null);
  const [user,setUser]=useState(null);
  const [isOwner,setIsOwner]=useState(false);
  const [showLogin,setShowLogin]=useState(false);
  const [pickupDate,setPickupDate]=useState('');
  const [returnDate,setReturnDate]=useState('');
  const [reviews,setReviews]=useState([]);
  const [cars,setCars]=useState([]);

  //fuction to check user login
  const fetchUser =async()=>{
    try{
       const {data}= await axios.get('/user/data');
       if(data.success && data.user){
        setUser(data.user);
        setIsOwner(data.user.role==='owner');
       }
       else{
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        delete axios.defaults.headers.common['Authorization'];
       }
    }
    catch(error){
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsOwner(false);
        delete axios.defaults.headers.common['Authorization'];
    }
  }
  //Function to fetch all cars from the server
  const fetchCars =async()=>{
    try{
       const {data}=  await axios.get('/user/cars');
       if(data.success && data.cars) {
         setCars(data.cars);
       }
    }
    catch(error){
        console.error("Error fetching cars:", error.message);
    }
  }

  //Function to fetch review
  const fetchReviews =async()=>{
    try{
      const {data}=  await axios.get('/review/get-review');
      if(data.success && data.review) {
        setReviews(data.review);
      }
    }
    catch(error){
        console.error("Error fetching reviews:", error.message);
    }
  }

  // Function to log out 
  const logout=()=>{
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
    navigate('/');
  }

  // useEffect to get the token from local storage
  useEffect(()=>{
    const savedToken=localStorage.getItem('token');
    if(savedToken){
      setToken(savedToken);
    }
    fetchCars();
  },[])

  useEffect(()=>{
    if(token){
      axios.defaults.headers.common['Authorization']= `Bearer ${token}`;
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  },[token])

    const value={
           navigate,currency, axios,user,setUser,token,setToken,isOwner,setIsOwner,
           fetchUser,setShowLogin,showLogin,logout,fetchCars,cars,setCars,pickupDate,
           setPickupDate, returnDate, setReturnDate, reviews,setReviews,
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext=()=>{
    return useContext(AppContext);
}