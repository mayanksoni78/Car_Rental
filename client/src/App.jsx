import {Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from"./pages/Home";
import MyBooking from"./pages/MyBooking";
import CarDetails from"./pages/CarDetails.jsx";
import Cars from "./pages/Car.jsx";
import Footer from './components/Footer'
import Layout from './pages/owner/Layout'
import Dashboard from "./pages/owner/Dashboard";
import AddCar from "./pages/owner/AddCar.jsx"
import ManageCar from "./pages/owner/ManageCars"
import ManageBooking from "./pages/owner/ManageBooking"
import LoginPage from "./components/LoginPage.jsx";
import{Toaster} from 'react-hot-toast';
import Review from "./pages/Review.jsx";
import AboutUs from "./components/AboutUs.jsx";
import ContactUs from "./components/ContactUs.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import BookingDetails from "./pages/BookingDetails.jsx";

const App = () => {

 const isOwnerPath =useLocation().pathname.startsWith("/owner")
 
  return (
    <>
    <Toaster/>
    
    {!isOwnerPath && <Navbar />}

      <Routes>
       
        <Route path="/" element={<Home />} />
         <Route path='/car-details/:id' element={<CarDetails/>}/>
         <Route path="/login" element={<LoginPage />} />
         <Route path="/my-booking" element={<MyBooking />} />
         <Route path="/booking/:bookingId" element={<BookingDetails />} />
         <Route path='/reviews' element={<Review/>}/>
         <Route path="/cars" element={<Cars />} />
         <Route path="/about-us" element={<AboutUs/>} />
         <Route path="/contact-us" element={<ContactUs/>} />
         <Route path="/checkout/:id" element={<Checkout />} />
         <Route path="/confirmation/:bookingId" element={<Confirmation />} />
         <Route path="/owner" element={<Layout />}>
          <Route index element={<Dashboard/>}/>
          <Route path="add-car" element={<AddCar/>}/>
          <Route path="manage-car" element={<ManageCar/>}/>
          <Route path="manage-booking-car" element={<ManageBooking/>}/>
        </Route>

      </Routes>
       <Footer/>
    </>
  );
};

export default App;
