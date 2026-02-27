
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <div className="flex items-center gap-1 mt-1 text-red-600 text-xs sm:text-sm">
        <AlertCircle className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
        <span>{message}</span>
    </div>
);
