import { useState } from 'react';
import { Link} from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type{ LucideIcon} from 'lucide-react'
import{ 
  Home, 
  Menu, 
  X, 
  Upload, 
  FileText, 
  MessageCircle, 
  User, 
  LogOut,
  LayoutDashboard,
 
} from 'lucide-react';


type Role = 'student' | 'parent' | 'teacher' | 'admin';

interface NavLink {
  to: string;
  label: string;
  icon?: LucideIcon;
}

interface UserInfo {
  name: string;
  email: string;
  role: Role;
}

interface NavLinksProps {
  role?: Role;
  onLinkClick?: () => void;
}

interface UserMenuProps {
  user: UserInfo;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

// Constants
const PUBLIC_NAV_LINKS: NavLink[] = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/helpus', label: 'Help' },
];

const ROLE_NAV_LINKS: Record<Role, NavLink[]> = {
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/upload', label: 'Upload Data', icon: Upload },
  ],
  teacher: [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/marks-entry', label: 'Marks Entry', icon: FileText },
    { to: '/teacher/chat', label: 'Messages', icon: MessageCircle },
  ],
  parent: [
    { to: '/parent/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/parent/student-details', label: 'Student Details', icon: User },
    { to: '/parent/chat', label: 'Messages', icon: MessageCircle },
  ],
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ],
};

const capitalizeRole = (role: string): string => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

// Reusable Components
const NavLinkItem = ({ to, label, icon: Icon, onClick }: NavLink & { onClick?: () => void }) => (
  <Link 
    to={to}
    onClick={onClick}
    className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </Link>
);

const PublicNavLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <>
    {PUBLIC_NAV_LINKS.map((link) => (
      <NavLinkItem key={link.to} {...link} onClick={onLinkClick} />
    ))}
  </>
);

const RoleBasedNavLinks = ({ role, onLinkClick }: NavLinksProps) => {
  if (!role) return <PublicNavLinks onLinkClick={onLinkClick} />;
  
  const links = ROLE_NAV_LINKS[role] || [];
  
  return (
    <>
      {links.map((link) => (
        <NavLinkItem key={link.to} {...link} onClick={onLinkClick} />
      ))}
    </>
  );
};

const UserAvatar = ({ name }: { name: string }) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center font-bold">
    {name.charAt(0).toUpperCase()}
  </div>
);

const UserDropdown = ({ user, onLogout }: { user: UserInfo; onLogout: () => void }) => (
  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
    <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600">
      <p className="text-sm font-semibold text-white">{user.name}</p>
      <p className="text-xs text-blue-100">{user.email}</p>
      <p className="text-xs text-white mt-1 bg-white/20 inline-block px-2 py-0.5 rounded-full">
        {capitalizeRole(user.role)}
      </p>
    </div>
    <button
      onClick={onLogout}
      className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  </div>
);

const UserMenu = ({ user, isOpen, onToggle, onLogout }: UserMenuProps) => (
  <div className="relative">
    <button
      onClick={onToggle}
      className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white hover:bg-white/20 transition-colors"
    >
      <UserAvatar name={user.name} />
      <span className="font-medium">{user.name}</span>
    </button>

    {isOpen && <UserDropdown user={user} onLogout={onLogout} />}
  </div>
);

const AuthButtons = ({ onLinkClick }: { onLinkClick?: () => void }) => (
  <>
    <Link 
      to="/signup" 
      onClick={onLinkClick}
      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
    >
      Signup
    </Link>
  </>
);

const MobileMenu = ({ 
  isOpen, 
  user, 
  onLinkClick, 
  onLogout 
}: { 
  isOpen: boolean; 
  user: UserInfo | null; 
  onLinkClick: () => void; 
  onLogout: () => void; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-[#0a0a0f] px-6 py-4 space-y-3">
      <RoleBasedNavLinks role={user?.role} onLinkClick={onLinkClick} />
      
      {!user ? (
        <>
          <Link 
            to="/login" 
            onClick={onLinkClick}
            className="block text-white hover:text-green-300"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            onClick={onLinkClick}
            className="block bg-green-500 text-white px-4 py-2 rounded-lg text-center"
          >
            Signup
          </Link>
        </>
      ) : (
        <button
          onClick={onLogout}
          className="w-full text-left text-red-300 hover:text-red-200 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      )}
    </div>
  );
};

const Logo = () => (
  <Link to="/" className="flex items-center gap-2">
    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
      <Home className="w-6 h-6 text-white" />
    </div>
    <h2 className="text-green-100 text-xl font-bold">EduCloud</h2>
  </Link>
);

// Main Component
function Navbar() {
  const { user, logout } = useAuth();
 
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <div className="bg-[#0F2854] shadow-lg">
      <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <RoleBasedNavLinks role={user?.role} />

          {!user ? (
            <AuthButtons />
          ) : (
            <UserMenu 
              user={user} 
              isOpen={open} 
              onToggle={() => setOpen(!open)} 
              onLogout={handleLogout} 
            />
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={open} 
        user={user} 
        onLinkClick={handleLinkClick} 
        onLogout={handleLogout} 
      />
    </div>
  );
}

export default Navbar;