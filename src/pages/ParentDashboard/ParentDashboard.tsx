import React, { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { FEATURES } from './constants';
import { FeatureCard } from './atoms/FeatureCard';
import { AccessSection } from './atoms/AccessSection';
import { DashboardHeader } from './atoms/DashboardHeader';

// ==================== MAIN COMPONENT ====================
const ParentDashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);

  const userName = useMemo(() => user?.name || 'Guest', [user?.name]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <DashboardHeader userName={userName} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        <AccessSection />
      </div>
    </div>
  );
};

export default ParentDashboard;