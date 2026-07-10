import { useContext , createContext } from "react";
import axios from "axios";
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom";
import { useState,useEffect  } from "react";

axios.defaults.baseURL = "http://localhost:2005"; 

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
       const {data}= await axios.get('/user/data')
       if(data.success){
        setUser(data.user);
        setIsOwner(data.user.role==='owner')
       }
       else{
        navigate('/')
       }
    }
    catch(error){
        toast.error(error.message);
    }
  }
  //Function to fetch all cars from the server
  const fetchCars =async()=>{
    try{
       const {data}=  await axios.get('/user/cars');
       data.success ? setCars(data.cars) :toast.error(data.message)

    }
    catch(error){
        toast.error(error.message)
    }
  }

  //Function to fetch review
  const fetchReviews =async()=>{
    try{
     const {data}=  await axios.get('/review/get-review');
       data.success ? setReviews(data.review) :toast.error(data.message)

    }
    catch(error){
        toast.error(error.message)
    }
  }

  // Function to log out 
  const logout=()=>{
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsOwner(false)
    axios.defaults.headers.common['Authorization']=''
    toast.success('You have been Log Out')
  }

  // useEffect to get the token from local storage
  useEffect(()=>{
    const token=localStorage.getItem('token')
    setToken(token)
    fetchCars()
  },[])

  useEffect(()=>{
         if(token){
            axios.defaults.headers.common['Authorization']= ` ${token}`
            fetchUser()
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