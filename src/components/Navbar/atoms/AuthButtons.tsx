import { Link } from 'react-router-dom';

export const AuthButtons = ({ onLinkClick }: { onLinkClick?: () => void }) => (
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
