import { NavLinkItem } from './NavLinkItem';
import { PUBLIC_NAV_LINKS, ROLE_NAV_LINKS } from '../constants';
import type { Role } from '../types';

interface NavLinksProps {
    role?: Role;
    onLinkClick?: () => void;
}

export const RoleBasedNavLinks = ({ role, onLinkClick }: NavLinksProps) => {
    const links = role ? (ROLE_NAV_LINKS[role] || []) : PUBLIC_NAV_LINKS;

    return (
        <>
            {links.map((link) => (
                <NavLinkItem key={link.to} {...link} onClick={onLinkClick} />
            ))}
        </>
    );
};
