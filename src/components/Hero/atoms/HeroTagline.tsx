
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const HeroTagline = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md"
    >
        <Sparkles size={16} />
        <span>Next-Generation Management System</span>
    </motion.div>
);
