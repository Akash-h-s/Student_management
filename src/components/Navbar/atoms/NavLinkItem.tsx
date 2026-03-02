import { Link } from 'react-router-dom';
import type { NavLink as NavLinkType } from '../types';

interface NavLinkProps extends NavLinkType {
    onClick?: () => void;
}

export const NavLinkItem = ({ to, label, icon: Icon, onClick }: NavLinkProps) => (
    <Link
        to={to}
        onClick={onClick}
        className="flex items-center gap-2 text-white hover:text-green-300 transition-colors"
    >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
    </Link>
);
