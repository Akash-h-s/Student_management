import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { Logo } from './atoms/Logo';
import { RoleBasedNavLinks } from './atoms/RoleBasedNavLinks';
import { UserMenu } from './atoms/UserMenu';
import { MobileMenu } from './atoms/MobileMenu';
import { AuthButtons } from './atoms/AuthButtons';

// Main Component
function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
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