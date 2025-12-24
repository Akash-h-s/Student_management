import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div id="main">
      <div id="navbar"  className="bg-[#0C2B4E] flex flex-row justify-between">
        <h2 className="text-[#ECF4E8] m-[10px]">EduCloud</h2>
        <nav id="links" className="flex justify  -between gap-[30px] items-center m-[10px]">
          <Link to="/" className="no-underline text-[white] mx-[15px] text-[20px]">Home</Link>
          <Link to="/services" className="no-underline text-[white] mx-[15px] text-[20px]">Services</Link>
          <Link to="/about" className="no-underline text-[white] mx-[15px] text-[20px]">About Us</Link>
          <Link to="/helpus" className="no-underline text-[white] mx-[15px] text-[20px]">Help?</Link>
          <Link to="/signup" className="no-underline text-[white] mx-[15px] text-[20px]">Login</Link>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;