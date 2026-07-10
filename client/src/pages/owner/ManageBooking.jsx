import React, { useState } from 'react'
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';


const ManageBooking = () => {
  const{axios, currency}=useAppContext();

  const [booking, setBooking]=useState([]);

  const fetchOwnerBooking= async()=>{
    try{
        const {data}=await axios.get('/bookings/owner')
        data.success ? setBooking(data.booking) : toast.error(data.message)
    }
    catch(error){
      toast.error(error.message);
    }
  }

    const changeBookingStatus= async(bookingId,status)=>{
    try{
       setBooking((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status } : b
      )
    );

        const {data}=await axios.post('/bookings/change-status',{bookingId,status})
        if(data.success){
          toast.success(data.message)
          fetchOwnerBooking();
        }
        else{
          toast.error(data.message);
          fetchOwnerBooking();
        }
       
    }
    catch(error){
      toast.error(error.message);
      fetchOwnerBooking();
    }
  }
  const deleteBooking= async(bookingId)=>{
    try{
      const{data}=await axios.post('/bookings/delete-booking',{bookingId});
        if(data.success){
          toast.success(data.message)
          setBooking((prev)=>
          prev.filter((b)=>b._id!=bookingId))
        }
        else{
          toast.error(data.message);
        }
    }
    catch(error){
      toast.error(error.message);
    }
  }
  
  useEffect(()=>{
    fetchOwnerBooking();
  },[])
  
  return (
  <div  className="sm:px-6 md:px-8 lg:px-12 bg-[#efeedd] min-h-screen">
    <Title title="Manage Bookings" subTitle="Track all customer bookings, approve or cancel requests, and manage booking status."/>
 
  <div className="mt-3 sm:mt-6 md:mt-8 bg-white rounded-lg shadow-md overflow-hidden">
     <table className="w-full border border-[#a7afaf]">
       <thead className=" md:table-header-group bg-gray-100 text-[#214650] uppercase text-[7px] sm:text-xs md:text-base">
        <tr>
          <th className="py-3 px-4 text-left">Car</th>
          <th className="py-3 px-4 text-left">Date Range</th>
          <th className="py-3 px-4 text-left">Total</th>
          <th className="py-3 px-4 text-left">Payment</th>
          <th className="py-3 px-4 text-left">Action</th>
        </tr>
      </thead>

       <tbody className="text-[7px] sm:text-sm text-[#224d4f]">
           {booking.map((booking, index) => (
              <tr key={index}  className="hover:bg-gray-50 transition border-b">
                
               <td className="py-2 sm:py-3 px-1 sm:px-4">                  
                <img src={booking.car.image}
                    alt=""
                    className="w-10 h-7 sm:w-18 sm:h-10 md:w-22 md:h-13 rounded-md object-cover"
                  />
                 <p className="font-medium text-[8px] sm:text-sm text-[#1a3531]">{booking.car.brand} {booking.car.model}</p>
                </td>

                <td className="py-1 sm:py-3 px-1 sm:px-4 whitespace-nowrap">
                  {booking.pickupDate.split('T')[0]} to {booking.returnDate.split('T')[0]}
                </td>

                  <td className="py-1 sm:py-3 px-4 sm:px-4 whitespace-nowrap">
                  {currency}{booking.price}
                </td>

               <td className="py-1 sm:py-3 px-5 sm:px-4 whitespace-nowrap">                 
                 <span>offline</span>
                </td>

                 <td className="py-1 sm:py-3 px-1 sm:px-4 whitespace-nowrap">{booking.status==='pending' ?(
                  <select onChange={(e)=> changeBookingStatus(booking._id,e.target.value)} value={booking.status}  className="border border-gray-300 rounded-md px-2 py-1 text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ): (<>
                <span className={`px-1 py-1 rounded text-[7px] sm:text-xs font-semibold ${booking.status==="confirmed"?"bg-green-200  text-green-700" : 'bg-red-200  text-red-700'}`}>{booking.status}</span>
                <button onClick={()=>deleteBooking(booking._id)} ><i className="px-1.5 sm:px-5 fa-solid fa-trash text-[#0d4b50] hover:text-red-700 cursor-pointer transition text-[10px] sm:text-base" title="Delete Car"></i>
                  </button>
                  </>
                )}
                </td>
                
              </tr>
            ))} 
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBooking;