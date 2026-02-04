// src/pages/TeacherDashboard.tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageCircle} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  color: string;
}

interface Responsibility {
  text: string;
}


const FEATURES: Feature[] = [
  {
    title: 'Marks Entry',
    description: 'Enter and manage student marks',
    icon: FileText,
    link: '/teacher/marks-entry',
    color: 'bg-purple-500',
  },
  {
    title: 'Messages',
    description: 'Chat with parents and create groups',
    icon: MessageCircle,
    link: '/teacher/chat',
    color: 'bg-indigo-500',
  },
] as const;

const RESPONSIBILITIES: Responsibility[] = [
  { text: 'Enter and manage student marks' },
  { text: 'Communicate with parents via messaging' },
  { text: 'Create and manage parent groups' },
] as const;

const STYLES = {
  card: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
  iconContainer: 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
  icon: 'w-6 h-6 text-white',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600',
  bullet: 'w-2 h-2 bg-purple-500 rounded-full',
} as const;

// ==================== SUB-COMPONENTS ====================
interface FeatureCardProps {
  feature: Feature;
}

const FeatureCard = React.memo(({ feature }: FeatureCardProps) => {
  const Icon = feature.icon;

  return (
    <Link to={feature.link} className={STYLES.card}>
      <div className={`${feature.color} ${STYLES.iconContainer}`}>
        <Icon className={STYLES.icon} />
      </div>
      <h3 className={STYLES.title}>{feature.title}</h3>
      <p className={STYLES.description}>{feature.description}</p>
    </Link>
  );
});
FeatureCard.displayName = 'FeatureCard';

interface ResponsibilityItemProps {
  item: Responsibility;
}

const ResponsibilityItem = React.memo(({ item }: ResponsibilityItemProps) => (
  <li className="flex items-center gap-2">
    <span className={STYLES.bullet} />
    <span>{item.text}</span>
  </li>
));
ResponsibilityItem.displayName = 'ResponsibilityItem';

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader = React.memo(({ userName }: DashboardHeaderProps) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome back, {userName}!</p>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

const ResponsibilitiesSection = React.memo(() => (
  <div className="mt-8 bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Teacher Responsibilities</h2>
    <ul className="space-y-2 text-gray-600">
      {RESPONSIBILITIES.map((item, index) => (
        <ResponsibilityItem key={index} item={item} />
      ))}
    </ul>
  </div>
));
ResponsibilitiesSection.displayName = 'ResponsibilitiesSection';

// ==================== MAIN COMPONENT ====================
const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

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

        <ResponsibilitiesSection />
      </div>
    </div>
  );
};

export default TeacherDashboard;