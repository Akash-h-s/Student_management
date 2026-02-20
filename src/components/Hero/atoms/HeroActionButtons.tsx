
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HeroActionButtons = () => (
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
);
