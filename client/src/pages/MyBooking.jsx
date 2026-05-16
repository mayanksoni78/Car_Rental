import React ,{useState,useEffect} from 'react'
import { useAppContext } from '../context/AppContext'
import Title from '../components/Title';
import toast from 'react-hot-toast';

const MyBooking = () => {
 
  const{axios,user,currency}= useAppContext();
 
  const[bookings, setBookings] =useState([])

  const fetchMyBookings =async ()=>{
    try{
   const {data}= await axios.get('/bookings/user')
   if(data.success){
    setBookings(data.booking)
   }
   else{
       toast.error(data.message)
   }
    }
    catch(error){
      toast.error(error.message)
    }
  }

  const  today=new Date();
  const activeBookings=bookings.filter(
    booking=>new Date(booking.returnDate)>=today)
  

  useEffect(()=>{
    user && fetchMyBookings()
  },[user])

  return (
<div className="px-3 md:px-10 lg:px-15 py-10 bg-[#efeedd] min-h-screen">
  <Title title="My Booking" subTitle="View and manage your all car booking"/>

  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mt-6 sm:mt-12">
    {activeBookings.map((booking, index) => (
      <div key={booking._id} className="mb-6 border-b border-gray pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[260px_140px_220px_220px_200px] items-center gap-y-4 gap-x-6 text-[10px] sm:text-xs">
       <div className="flex items-center gap-3 w-full lg:w-auto">
            <img 
              src={booking.car.image} 
              alt="car-image"  
              className="w-16 h-10 sm:w-30 sm:h-20 md:w-37 md:h-24  object-cover rounded-lg"
            />
          
          <div className="flex flex-col ">
            <p className="font-bold text-xs sm:text-sm md:text-base text-[#20424f]">
               {booking.car.brand} {booking.car.model}
            </p>
            <p className="text-[9px] sm:text-[11px]   text-[#2e5958]">
              {booking.car.year} • {booking.car.category} • {booking.car.location}
            </p>
          </div>
        </div>
     
        <div > 
          <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 ">
              <p className="mt-2 text-[10px] sm:text-xs text-[#204757] flex items-center gap-1">
              <i className="fas fa-receipt "></i>
              Booking #{index + 1}
            </p>
            <p className={`text-[9px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
              booking.status === 'confirmed' 
                ? 'bg-green-400/15 text-green-600' 
                : 'bg-red-400/15 text-red-600'
            }`}>
              <i className={`fas ${
                booking.status === 'confirmed' 
                  ? 'fa-check-circle' 
                  : 'fa-times-circle'
              } mr-1`}></i>
              {booking.status}
            </p>
          </div>
        </div>
     
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-[10px] sm:text-xs lg:text-sm">
          <i className="fas fa-calendar-alt text-[#0b383b] text-[10px] sm:text-sm md:text-base mt-1"></i>
          <div>
            <p className="font-medium text-[#0d4b50] ">Rental Period</p>
            <p className="text-gray-500">
              {booking.pickupDate.split('T')[0]} To {booking.returnDate.split('T')[0]}
            </p>
          </div>
        </div>
      
       <div className="flex flex-col gap-3 text-[11px] sm:text-xs lg:text-sm">
          <div className="flex items-start gap-1 sm:gap-2 md:gap-3">
            <i className="fas fa-map-marker-alt text-[#0b383b] text-[10px] sm:text-sm md:text-base mt-1"></i>
            <div>
              <p className="font-semibold text-[10px] sm:text-xs lg:text-sm text-[#0d4b50]">Pick-up Location</p>
              <h1 className=" text-[10px] sm:text-xs lg:text-sm text-[#0d4b50]">
                {booking.car.location}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:gap-2 md:gap-3 text-[11px] sm:text-xs lg:text-sm ">
          <div className="flex  gap-1">
            <i className="fas fa-dollar-sign text-[#0b383b] text-[10px] sm:text-sm md:text-base mt-2"></i>
            <div>
              <p className="font-semibold text-[10px] sm:text-xs lg:text-sm text-[#0d4b50]">Total Price</p>
              <h1 className=" text-[10px] sm:text-xs lg:text-sm text-[#0d4b50]">
                {currency}{booking.price}
              </h1>

              <p className="text-[10px] sm:text-xs lg:text-sm text-[#434c4d] mt-2 sm:mt-0 font-semibold">
                <i className="far fa-clock mr-2 font-extrabold text-[#0b383b] text-[10px] sm:text-sm md:text-base mt-2 "></i>
                Booked on {booking.createdAt.split('T')[0]}
              </p>
            </div>
          </div>
        </div>

      </div>
    ))}
  </div>  
</div>
  )
}

export default MyBooking