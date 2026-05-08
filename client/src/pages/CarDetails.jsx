import React,{useState,useEffect} from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

const Cardetails = () => {

  const {currency,cars,axios,pickupDate, setPickupDate, returnDate, setReturnDate,navigate}=useAppContext()

  const{id}=useParams()
  
  const[car,setCar]=useState(null)

  const handleSubmit= async(e)=>{
    e.preventDefault();
     if (pickupDate === returnDate) {
    toast.error("Pickup date and return date cannot be the same");
       return;
  }

   if (new Date(returnDate) < new Date(pickupDate)) {
    toast.error("Return date must be after pickup date");
    return;
  }

    try{
      const {data} = await axios.post('bookings/create',{car:id, pickupDate, returnDate})
    
      if(data.success){
        toast.success(data.message)
        navigate('/my-booking')
      }
      else{
         toast.error(data.message)
      }
    }
    catch(error){
      toast.error(error.message)
    }
  }
  
 useEffect(()=>{
 setCar(cars.find(car=>car._id === id))
 },[cars,id])

 

return car? (
  <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 bg-[#efeedd] min-h-screen">
    <button onClick={()=>navigate(-1)}  className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-600 hover:text-blue-600 mb-4 sm:mb-6 transition">
       <i className="fa-solid fa-arrow-left"></i>
      Back to all cars
    </button>
     
     <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

       <div className="flex-1 bg-white rounded-xl shadow-md p-3 sm:p-5 md:p-6">
        <img src={car.image} alt="car-image"  className="w-full sm:w-72 md:w-80 h-44 sm:h-48 object-cover rounded-lg mb-4"/>
        <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                  {car.brand} {car.model}
                  <span className="ml-2 text-base font-normal text-gray-500">({car.number})</span>
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-xs font-medium">{car.category}</span>
                  <span>•</span>
                  <span>{car.year}</span>
                </p>
              </div>
              
              <hr className="border-amber-100" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: "fa-solid fa-user-group", text: `${car.seating_capacity} Seats`, color: "text-blue-600" },
                  { icon: "fa-solid fa-gas-pump", text: car.fuel_type, color: "text-green-600" },
                  { icon: "fa-solid fa-car-side", text: car.transmission, color: "text-purple-600" },
                  { icon: "fa-solid fa-location-dot", text: car.location, color: "text-red-600" }
                ].map(({ icon, text, color }) => (
                  <div key={text} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-amber-50 transition-colors group">
                    <i className={`${icon} ${color} text-lg group-hover:scale-110 transition-transform`}></i>
                    <span className="text-gray-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-[#e4f9ff] to-[#8de0f0] p-4 rounded-xl border border-amber-100">
                <h2 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-file-lines text-teal-600"></i>
                  Description
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{car.description}</p>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl">
                <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-user text-teal-600"></i>
                  Owner Details
                </h2>
                <div className="space-y-1">
                  <p className="text-sm text-gray-800 font-semibold">{car.ownerName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <i className="fa-solid fa-phone text-teal-600"></i>
                    {car.phone_no}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                  <i className="fa-solid fa-star text-amber-500"></i>
                  Premium Features
                </h2>
                <ul className="grid grid-cols-2 gap-3">
                  {["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                    <li className="flex items-center gap-2 text-sm text-gray-700 bg-white p-2 rounded-lg hover:bg-teal-50 transition-colors group" key={item}>
                      <i className="fa-solid fa-check text-green-500 group-hover:scale-125 transition-transform"></i>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
      
      <form onSubmit={handleSubmit}  className="w-full lg:w-80 bg-white rounded-xl shadow-md p-3 sm:p-5 md:p-6 space-y-4">
           
            <div className="bg-gradient-to-br from-[#25bbcc] to-[#09413f] text-white p-4  -m-6 mb-4">
              <p className="text-3xl font-bold">₹{car.pricePerDay}</p>
              <span className="text-sm text-teal-100">per day</span>
            </div>
            
         <hr className="border-gray-200" />
       
       <div className="space-y-1">
         <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-[#09413f]"></i>Pickup Date</label>
        <input value={pickupDate} onChange={(e)=>setPickupDate(e.target.value)} type="date" required id='pickup-date' min={new Date().toISOString().split('T')[0]}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 outline-none"></input>
       </div>

       <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-[#09413f]"></i>Return Date</label>
        <input value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} type="date" required id='return-date' min={new Date().toISOString().split('T')[0]}
         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-400 outline-none"></input>
       </div>

       <button  type="submit"
       className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium">Book Now</button>
         <p className="text-[10px] sm:text-xs text-gray-500 text-center"> No credit card required to reserve</p>
      </form>
    </div>
    
  </div>
  ):<Loader/>
}

export default Cardetails
