import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div id="main">
      <div className="bg-blue-900 flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <h2 className="text-green-100 text-xl font-bold">EduCloud</h2>

        {/* Navigation Links */}
        <nav className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-white text-lg no-underline hover:text-green-200 transition"
          >
            Home
          </Link>
          <Link
            to="/services"
            className="text-white text-lg no-underline hover:text-green-200 transition"
          >
            Services
          </Link>
          <Link
            to="/about"
            className="text-white text-lg no-underline hover:text-green-200 transition"
          >
            About Us
          </Link>
          <Link
            to="/helpus"
            className="text-white text-lg no-underline hover:text-green-200 transition"
          >
            Help?
          </Link>
          <Link
            to="/signup"
            className="text-white text-lg no-underline hover:text-green-200 transition"
          >
            Login
          </Link>
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
