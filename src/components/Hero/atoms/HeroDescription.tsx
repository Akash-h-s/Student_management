
import { motion } from 'framer-motion';

export const HeroDescription = () => (
    <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-gray-400 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed mb-10"
    >
        Empower your school with a seamless, intuitive, and secure management ecosystem.
        Built for administrators, teachers, and students.
    </motion.p>
);
