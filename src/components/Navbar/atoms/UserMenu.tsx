import { LogOut } from 'lucide-react';
import type { UserInfo } from '../types';

const capitalizeRole = (role: string): string => {
    return role.charAt(0).toUpperCase() + role.slice(1);
};

export const UserAvatar = ({ name }: { name: string }) => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center font-bold">
        {name.charAt(0).toUpperCase()}
    </div>
);

export const UserDropdown = ({ user, onLogout }: { user: UserInfo; onLogout: () => void }) => (
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

interface UserMenuProps {
    user: UserInfo;
    isOpen: boolean;
    onToggle: () => void;
    onLogout: () => void;
}

export const UserMenu = ({ user, isOpen, onToggle, onLogout }: UserMenuProps) => (
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
