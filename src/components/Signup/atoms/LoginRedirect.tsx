
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

export const LoginRedirect = () => (
    <p className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-blue-600 hover:underline font-medium">
            Login here
        </Link>
    </p>
);
