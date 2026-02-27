import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { RoleBasedNavLinks } from './RoleBasedNavLinks';
import type { UserInfo } from '../types';

interface MobileMenuProps {
    isOpen: boolean;
    user: UserInfo | null;
    onLinkClick: () => void;
    onLogout: () => void;
}

export const MobileMenu = ({
    isOpen,
    user,
    onLinkClick,
    onLogout
}: MobileMenuProps) => {
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
