import React, { useContext, useEffect, useState } from 'react'
import CarDetails from './CarDetails'
import {useAppContext} from '../context/AppContext'
import { useSearchParams } from 'react-router-dom'
import Title from '../components/Title'
import CarCard from '../components/CarCards'

const Car = () => {
// getting search parameters from url
  const[searchParams]=useSearchParams();
  
  const pickupLocation = searchParams.get('pickupLocation')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  const {cars, axios} = useAppContext();

  const[input,setInput]=useState('')

  const isSearchData =pickupLocation && pickupDate && returnDate
  const[filterCars,setFilterCars]=useState([])

 const applyFilter =async()=>{
 if(input===''){
    setFilterCars(cars)
    return null
  }
  const filtered = cars.slice().filter((car)=>{
    return car.brand.toLowerCase().includes(input.toLowerCase())
       ||  car.model.toLowerCase().includes(input.toLowerCase())
       ||  car.category.toLowerCase().includes(input.toLowerCase())
       ||  car.transmission.toLowerCase().includes(input.toLowerCase())
  })
  setFilterCars(filtered)
 }


  const searchCarAvailability =async()=>{
    
    const{data}= await axios.post('/bookings/check-availability', {location: pickupLocation, pickupDate,returnDate} )
   if (data.success){
    setFilterCars(data.availableCars);
    if(data.availableCars===0){
      toast('No Car is Available')
    }
    return null
   }
  }

  useEffect(()=>{
    isSearchData && searchCarAvailability()
  },[])

   useEffect(()=>{
    cars.length>0 && !isSearchData && applyFilter()
  },[input,cars])


  return (
    <div className="min-h-screen bg-[#efeedd] px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10">

     <div className="text-center mb-5 sm:mb-8">
      <Title title="Available Cars" subTitle="Browse our selection of Premium Vehicles for your next adventure"/>
    
       <div className="relative mt-4 w-full max-w-xs sm:max-w-md mx-auto">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition"></i>
         <input onChange={(e)=> setInput(e.target.value)} value={input} type="text" placeholder='Search Cars' 
         className="w-full max-w-xs sm:max-w-md border border-gray-300 rounded-3xl pl-10 pr-10 px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none  transition-all"/>
        <i className="fa-solid fa-filter absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500 transition"></i>
      </div>

     </div>

     <div className="text-center mb-4 sm:mb-6">
        <p className="text-[#113431] font-medium text-sm sm:text-base">Showing {filterCars.length} Cars</p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {filterCars.map((car,index)=>(
          <div key={index}>
            <CarCard car={car}/>
            </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default Car