import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS } from '../../graphql/dashboard';

const Hero = () => {
    const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
        pollInterval: 30000,
        fetchPolicy: 'cache-and-network',
    });

    if (error) {
        console.warn('[Hero Stats]: Falling back to baseline due to connection issue', error);
    }

    const stats = [
        {
            label: 'Active Students',
            value: data?.students_aggregate?.aggregate?.count ?? 0,
            suffix: (data?.students_aggregate?.aggregate?.count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Registered Teachers',
            value: data?.teachers_aggregate?.aggregate?.count ?? 0,
            suffix: (data?.teachers_aggregate?.aggregate?.count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Registered Schools',
            value: data?.admins_aggregate?.aggregate?.count ?? 0,
            suffix: (data?.admins_aggregate?.aggregate?.count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Parents Connected',
            value: data?.parents_aggregate?.aggregate?.count ?? 0,
            suffix: (data?.parents_aggregate?.aggregate?.count ?? 0) > 0 ? '+' : ''
        },
    ];

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
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

            {/* Content Container */}
            <div className="container mx-auto px-6 pt-5 pb-5 sm:pt-32 sm:pb-48 lg:py-0 relative z-10">
                <div className="flex flex-col items-center text-center">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md"
                    >
                        <Sparkles size={16} />
                        <span>Next-Generation Management System</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black mb-6 tracking-tight"
                    >
                        <span className="text-white">Smart </span>
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                            EduCloud
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10"
                    >
                        Empower your school with a seamless, intuitive, and secure management ecosystem.
                        Built for administrators, teachers, and students.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-center justify-center w-full max-w-sm sm:max-w-none mx-auto"
                    >
                        <Link
                            to="/signup"
                            className="w-full sm:w-auto group relative px-8 py-4 bg-blue-600 rounded-2xl text-white font-bold transition-all hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20 text-center"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Get Started Now <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            to="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 text-center"
                        >
                            Sign In to Portal
                        </Link>
                    </motion.div>

                    {/* Stats Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1 }}
                        className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full max-w-4xl p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl mx-auto"
                    >
                        {stats.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                                    {loading ? '...' : `${stat.value.toLocaleString()}${stat.suffix}`}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Decorative Bottom Shadow */}
            <div className="absolute bottom-0 left-0 w-full h-[150px] bg-gradient-to-t from-[#0a0a0f] to-transparent"></div>
        </div>
    );
};


export default Hero;
