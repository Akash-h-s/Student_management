import React from 'react';

interface AILoadingStateProps {
    message?: string;
    subMessage?: string;
}

const AILoadingState: React.FC<AILoadingStateProps> = ({
    message = 'AI is analyzing...',
    subMessage = 'This usually takes a few seconds',
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            {/* Animated AI Brain Icon */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-400 animate-pulse flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <svg
                        className="w-10 h-10 text-white animate-spin"
                        style={{ animationDuration: '3s' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        />
                    </svg>
                </div>
                {/* Orbiting dots */}
                <div className="absolute inset-0 w-20 h-20 animate-spin" style={{ animationDuration: '4s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-purple-400 rounded-full" />
                </div>
                <div className="absolute inset-0 w-20 h-20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-cyan-400 rounded-full" />
                </div>
            </div>

            {/* Text */}
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{message}</h3>
            <p className="text-sm text-gray-500">{subMessage}</p>

            {/* Animated progress bar */}
            <div className="w-64 h-1.5 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-full"
                    style={{
                        animation: 'aiProgress 2s ease-in-out infinite',
                        width: '40%',
                    }}
                />
            </div>

            <style>{`
        @keyframes aiProgress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
        </div>
    );
};

export default AILoadingState;
