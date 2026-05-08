import React, { useState } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
const AddCar = () => {

  const{axios, currency,user}=useAppContext();

  const[image,setImage]=useState(null)

  const [car,setCar]=useState({
    brand:' ',
    model:' ',
    number:'',
    year:0,
    pricePerDay:0,
    category:'',
    transmission:'',
    fuel_type:'',
    seating_capacity:0,
    location:'',
    description:'',
  })

  const[isLoading , setIsLoading] =useState(false)

  const onSubmitHandler=async (e)=>{
    e.preventDefault()
    if(isLoading){
      return null;
    }
    setIsLoading(true)
    try{
      const formData =new FormData()
      formData.append('image',image)
      formData.append('carData',JSON.stringify(car))

      const {data} =await axios.post('/owner/add-car', formData)

      if(data.success){
        toast.success(data.message)
        setImage(null);
        setCar({
        brand:'',
        model:'',
        number:'',
        year:0,
        pricePerDay:0,
       category:'',
       transmission:'',
       fuel_type:'',
       seating_capacity:0,
       location:'',
       description:'',
        })
      }
      else{
         toast.error(data.message)
      }
    }
    catch(error){
      toast.error(error.message)
    }
    finally{
      setIsLoading(false)
    }
  }

const cityList=[
    "Delhi","Mumbai","Bengaluru","Chennai", "Kolkata", "Ahmedabad", "Hyderabad",
  ]

  return (

    <div className="px-6 md:px-16 lg:px-28 py-10 bg-[#efeedd] min-h-screen">
    <Title title="Add New Car" subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specifications."/>
    
    <form onSubmit={onSubmitHandler}  className="bg-white p-8 rounded-xl shadow-md mt-8 space-y-8">

    <div className="flex flex-col items-center gap-2 sm:gap-3">

      <label htmlFor="car-image"  className="cursor-pointer">
        <img src={image ? URL.createObjectURL(image):"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAaVBMVEX///8AAABNTU3p6em1tbVRUVGrq6vd3d3e3t77+/tXV1fa2trNzc0YGBgfHx81NTXw8PDExMRlZWW8vLyFhYUvLy92dnZERESdnZ1bW1vz8/NycnIPDw9tbW3l5eWwsLA8PDwpKSkjIyMVq0aKAAADqklEQVR4nO3da1PiQBCF4YkBuQoCooguqP//R64upWYmk0sn2z2c1Hm+sVSq5y0Fb5lZ54iIiIiIiIiIiIiIiIiIiIiIiIgq5JvRJk+9CEWTcfZlPEm9EC3n7Ns59VJ03Ga/blMvRkMxcJCJfuAAE8PAwSWWAweWGAscVGI8cECJVYGDSawOHEhiXeAgEusDB5DYFAif2BwIntgmEDqxXSBwYttA2MT2gaCJkkDIRFkgYKI0EC5RHgiW2CUQKjEWuNp7D/cr5MToR/A09x7OT8AfxWjgwt14j2/cAjYxGjhxpUI3AU2MBk5dpNBNIRMrAyOFkIlVn6IuWgj4ibqJrXhxeS5WGH+72aQLaHRXHRgvjCbepVp+s11kuT9/DY0XRj9Rd2mW38JjTWBVYSzxMcXiWxnXBFYWRhLH9ktvaR4udVF4srKw/FqcWy+8tYeawJrCUuKD7bIFljWBdYVh4tJy0TJPxXUG95TUFfqvxSe7BYvl1YH1hV7iVd9SNP3+mr+ahk/VF7rp94/Ed6Urr8vssP5c5fowKz3TUFhz5dW5z+9j/9xUWH0lihaF4FiIj4X4WIiPhfhYiI+F+FiIj4X4WIiPhfhYiI+F+FiIj4X4WIiPhfhYiI+F+FiIj4X4oArvN6ON+P6snoWdZnY0udzs/Cy8h7BX4fT531Vzk3PQfs8kG4mu61M4+rnO4By04rYY0d3KPQqLd1frb6gp7v0UbW7pUVjcirOSLVdu5K1Tsrmle6G/FUf22pDzt8VINrd0L+w+swt/W4xk60f3Qn+jivaGmnHnacFOZ5OZXXSf5m+okWyLQSn0N9RIvtCgFHobakTbYmAKixtqRNtiYAp/t8WUN9SozZTrNW12+DocYy/dFgNU+OmYH81nXvO0FDNZiD+ThfgzWYg/k4X4M1mIP5OF+DOHX+j/xmytPO1i7c3UPrxm603LlKdd+CO3ytOCQ3YszqwKztfSPp4nOHLuXXncl3d/pPaBdeGBRy/K85x7CSYumi/pZfYaDNzKf+8icQxe+Nmr+ukuf7LQw/KU6zgtw7O1suyPdmD8aERDBocqfiQN/NAPLNypkILJ/9i2b16Hmr1FYHjunCmjs+rKb3BWzI4bvGleiwq7m+Fm6+bVKFgbHuV2fEsQ+Kb73VMo/GZKn/ZPTSUH48CDdaBzueWHcZvmPMyFVeNW+yemasezfuT2bPsOU5YvdyMtu+VVn9ZKRERERERERERERERERERERERE/91fq2UnrlYpI/sAAAAASUVORK5CYII="} alt="Upload image"  
        className="  w-10 h-7 sm:w-12 sm:h-10  md:w-14 md:h-12 rounded-xl  border-2 border-dashed border-gray-300  object-cover  bg-[#efeedd] hover:border-blue-400 transition-all duration-300"/>
        <input type="file"  id="car-image" accept="image/*" hidden onChange={e=>setImage(e.target.files[0])} />
      </label>
      <p className="text-[#1d5160] text-xs sm:text-base mt-2 text-center">Upload a picture of a car</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <div className="flex flex-col">
        <label className="block text-[#132a2d] font-medium mb-1 text-sm sm:text-base">Brand</label>
        <input type="text" placeholder="e.g. BMW, Mercedes, Audi...."required value={car.brand} onChange={e=>setCar({...car,brand:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"/>
      </div>

       <div className="flex flex-col">
         <label className="block  text-[#132a2d] font-medium mb-1 text-sm sm:text-base">Model</label>
        <input type="text" placeholder="e.g. X5,E-Class"required value={car.model} onChange={e=>setCar({...car,model:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"/>
       </div>

       <div className="flex flex-col">
         <label className="block  text-[#132a2d] font-medium mb-1 text-sm sm:text-base">Car Number</label>
        <input type="text" placeholder="e.g. KA01AB1234" required value={car.number} onChange={e=>setCar({...car,number:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"/>
       </div>
    </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div>
        <label className="block text-[#132a2d] font-medium mb-1">Year</label>
        <input type="number" placeholder="2025" required value={car.year} onChange={e=>setCar({...car,year:e.target.value})}  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"/>
      </div>

      <div className="block  text-[#132a2d] font-medium mb-1">
        <label>Daily Price{currency}</label>
        <input type="number" placeholder="100" required value={car.pricePerDay} onChange={e=>setCar({...car,pricePerDay:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            />
      </div>

        <div > 
        <label className="block  text-[#132a2d] font-medium mb-1">Category</label>
        <select onChange={e=>setCar({...car, category: e.target.value})} value={car.category} className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none">
          <option value="">Select a Category</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
        </select>
      </div>

    </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
        <label className="block  text-[#132a2d] font-medium mb-1">Transmission</label>
        <select onChange={e=>setCar({...car, transmission: e.target.value})} value={car.transmission}  className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none">
          <option value="">Select a Transmission</option>
            <option value="Automatic">Automatic</option>
            <option value="Manul">Manul</option>
            <option value="Semi-Automatic">Semi-Automatic</option>
        </select>
      </div>
        <div>
        <label  className="block  text-[#132a2d] font-medium mb-1">Fuel Type</label>
        <select onChange={e=>setCar({...car, fuel_type: e.target.value})} value={car.fuel_type}  className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none">
          <option value="">Select a Fuel Type</option>
            <option value="Gas">Gas</option>
            <option value="Diesel">Diesel</option>
            <option value="Petrol">Petrol</option>
            <option value="Hybrid">Hybrid</option>
        </select>
      </div>
       <div>
        <label  className="block  text-[#132a2d] font-medium mb-1">Seating Capacity</label>
        <input type="number" placeholder="4" required value={car.seating_capacity} onChange={e=>setCar({...car,seating_capacity:e.target.value})} className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none"/>
      </div>
    </div>

    <div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block  text-[#132a2d] font-medium mb-1">Location</label>
        <select onChange={e=>setCar({...car, location: e.target.value})} value={car.location}  className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-blue-400 outline-none">
          <option value="">Select a Location</option>
          {cityList.map((city,index)=>(
            <option key={index} value={city}>{city}</option>
          ))}
        
        </select>
      </div>
      <div  className="flex flex-col mt-7 ">
        <label className="block  text-[#132a2d] font-medium mb-3 text-sm sm:text-base">Description</label>
        <textarea rows={5} placeholder="Text..." required value={car.description} onChange={e=>setCar({...car,description:e.target.value})}  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
            ></textarea>
      </div >

      <button className="flex items-center gap-2 mt-7 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md">
      
       {isLoading ?'Listing' : 'List Your Car'}
      </button>
    </div>
    </form>
    </div>
  );
};

export default AddCar;
