
import { Building2 } from 'lucide-react';

export const SignupHeader = () => (
    <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <Building2 className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Registration</h2>
        <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">Create your school's admin account</p>
    </div>
);
