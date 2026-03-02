

const LoadingSpinner = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
);

interface SignupButtonProps {
    loading: boolean;
}

export const SignupButton = ({ loading }: SignupButtonProps) => (
    <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold text-white transition-all ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
    >
        {loading ? (
            <span className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                Creating Account...
            </span>
        ) : (
            'Create Admin Account'
        )}
    </button>
);
