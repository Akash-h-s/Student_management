
export const HeroBackground = () => (
    <>
        {/* Dynamic Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-float"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div
            className="absolute inset-0 z-0 opacity-[0.15]"
            style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
            }}
        ></div>

        {/* Decorative Bottom Shadow */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
    </>
);
