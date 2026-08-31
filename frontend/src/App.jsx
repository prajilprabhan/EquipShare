import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./components/Home";
import About from "./components/About";
import Equipment from "./components/Equipment";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Signup from "./components/Signup";
import Login from "./components/Login";

// Import dashboards
import UserDashboard from "./users/Dashboard";
import MyBookings from "./users/MyBookings";
import AdminDashboard from "./admin/Dashboard";
import HodDashboard from "./hod/Dashboard";
import LabasistDashboard from "./labasist/Dashboard";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/equipments" element={<Equipment />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard and Booking routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/bookings" element={<MyBookings />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/hod/dashboard" element={<HodDashboard />} />
        <Route path="/labasist/dashboard" element={<LabasistDashboard />} />

      </Routes>
    <Footer/>
    </BrowserRouter>
  );
}

export default App;