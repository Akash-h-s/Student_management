
import { motion } from 'framer-motion';

export const HeroHeading = () => (
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
);
