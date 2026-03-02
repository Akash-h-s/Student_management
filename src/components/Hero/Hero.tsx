import { useDashboardStats } from '../../hooks/useDashboardStats';
import { HeroBackground } from './atoms/HeroBackground';
import { HeroTagline } from './atoms/HeroTagline';
import { HeroHeading } from './atoms/HeroHeading';
import { HeroDescription } from './atoms/HeroDescription';
import { HeroActionButtons } from './atoms/HeroActionButtons';
import { HeroStats } from './atoms/HeroStats';
import type { Stat } from './atoms/HeroStats';

import React from 'react';

const Hero: React.FC = () => {
    const { stats: dashboardStats, loading, error } = useDashboardStats();

    if (error) {
        console.warn('[Hero Stats]: Falling back to baseline due to connection issue');
    }

    const stats: Stat[] = [
        {
            label: 'Active Students',
            value: dashboardStats?.students_count ?? 0,
            suffix: (dashboardStats?.students_count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Registered Teachers',
            value: dashboardStats?.teachers_count ?? 0,
            suffix: (dashboardStats?.teachers_count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Registered Schools',
            value: dashboardStats?.admins_count ?? 0,
            suffix: (dashboardStats?.admins_count ?? 0) > 0 ? '+' : ''
        },
        {
            label: 'Parents Connected',
            value: dashboardStats?.parents_count ?? 0,
            suffix: (dashboardStats?.parents_count ?? 0) > 0 ? '+' : ''
        },
    ];

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0f]">
            <HeroBackground />

            {/* Content Container */}
            <div className="container mx-auto px-6 pt-5 pb-5 sm:pt-32 sm:pb-48 lg:py-0 relative z-10">
                <div className="flex flex-col items-center text-center">
                    <HeroTagline />
                    <HeroHeading />
                    <HeroDescription />
                    <HeroActionButtons />
                    <HeroStats stats={stats} loading={loading} />
                </div>
            </div>
        </div>
    );
};

export default Hero;
