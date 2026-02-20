import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const Logo = () => (
    <Link to="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
            <Home className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-green-100 text-xl font-bold">EduCloud</h2>
    </Link>
);
