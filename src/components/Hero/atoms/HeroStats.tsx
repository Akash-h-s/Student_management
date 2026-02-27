
import { motion } from 'framer-motion';

export interface Stat {
    label: string;
    value: number;
    suffix: string;
}

interface HeroStatsProps {
    stats: Stat[];
    loading: boolean;
}

export const HeroStats = ({ stats, loading }: HeroStatsProps) => (
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
);
