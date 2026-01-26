import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { logout } from "../features/auth/authSlice";

function Navbar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="bg-blue-900 shadow-md">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <h2 className="text-green-100 text-xl font-bold">EduCloud</h2>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-white hover:text-green-300">Home</Link>
          <Link to="/services" className="text-white hover:text-green-300">Services</Link>
          <Link to="/about" className="text-white hover:text-green-300">About</Link>
          <Link to="/helpus" className="text-white hover:text-green-300">Help?</Link>

          {!user ? (
            <Link to="/signup" className="text-white px-4 py-1 rounded hover:bg-green-700">
              Signup
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-white"
              >
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span>{user.name}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-bold">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
