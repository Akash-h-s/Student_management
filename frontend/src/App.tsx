import Navbar from "./components/Navbar";
import Backgroundstyle from "./components/Backgroundstyle";
import Facilities from "./components/Facilities";
import Footer from "./components/Footer";
import AboutUs from "./components/AboutUs";
import Signup from "./components/Signuup";
import Login from "./components/Login";

import { Routes, Route } from "react-router-dom";
import Need from "./components/Need";
import HelpUs from "./components/HelpUs";
import Adminservices from "./components/Adminservices";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              
              <Backgroundstyle/>
              <Facilities />
              <Need/>
               <Footer />
            </>
          }
        />

        <Route path="/about" element={<>
        <AboutUs />
      <Footer/>
        </>} />
        <Route path="/services" element={<Adminservices/>} />
        <Route path="/helpus" element={<HelpUs/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
      
    </>
  );
}
