// src/components/Navbar.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, 
  Menu, 
  X, 
  Upload, 
  FileText, 
  MessageCircle, 
  User, 
  LogOut,
  LayoutDashboard 
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const getNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/" className="text-white hover:text-green-300 transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-white hover:text-green-300 transition-colors">
            About
          </Link>
          <Link to="/helpus" className="text-white hover:text-green-300 transition-colors">
            Help
          </Link>
        </>
      );
    }

    switch (user.role) {
      case 'admin':
        return (
          <>
            <Link 
              to="/admin/dashboard" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              to="/admin/upload" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Data
            </Link>
          </>
        );

      case 'teacher':
        return (
          <>
            <Link 
              to="/teacher/dashboard" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              to="/teacher/marks-entry" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Marks Entry
            </Link>
            <Link 
              to="/teacher/chat" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
          </>
        );

      case 'parent':
        return (
          <>
            <Link 
              to="/parent/dashboard" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              to="/parent/student-details" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <User className="w-4 h-4" />
              Student Details
            </Link>
            <Link 
              to="/parent/chat" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Messages
            </Link>
          </>
        );

      case 'student':
        return (
          <>
            <Link 
              to="/student/dashboard" 
              className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-blue-900 shadow-lg">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-green-100 text-xl font-bold">EduCloud</h2>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {getNavLinks()}

          {!user ? (
            <>
              <Link 
                to="/login" 
                className="text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                Signup
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium">{user.name}</span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-blue-100">{user.email}</p>
                    <p className="text-xs text-white mt-1 bg-white/20 inline-block px-2 py-0.5 rounded-full">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

       
        <button 
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>


      {open && (
        <div className="md:hidden bg-blue-800 px-6 py-4 space-y-3">
          {getNavLinks()}
          
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="block text-white hover:text-green-300"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="block bg-green-500 text-white px-4 py-2 rounded-lg text-center"
                onClick={() => setOpen(false)}
              >
                Signup
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full text-left text-red-300 hover:text-red-200 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;