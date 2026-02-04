// src/pages/ParentDashboard.tsx
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageCircle} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  color: string;
}

interface AccessItem {
  text: string;
}


const FEATURES: Feature[] = [
  {
    title: 'Student Details',
    description: "View your child's academic information",
    icon: User,
    link: '/parent/student-details',
    color: 'bg-green-500',
  },
  {
    title: 'Messages',
    description: 'Chat with teachers and view groups',
    icon: MessageCircle,
    link: '/parent/chat',
    color: 'bg-blue-500',
  },
] as const;

const ACCESS_ITEMS: AccessItem[] = [
  { text: "View your child's academic details" },
  { text: 'Check marks and performance' },
  { text: 'Communicate with teachers' },
  { text: 'View group messages and announcements' },
] as const;

const STYLES = {
  card: 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow',
  iconContainer: 'w-12 h-12 rounded-lg flex items-center justify-center mb-4',
  icon: 'w-6 h-6 text-white',
  title: 'text-xl font-semibold text-gray-900 mb-2',
  description: 'text-gray-600',
  bullet: 'w-2 h-2 bg-green-500 rounded-full',
} as const;


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

interface AccessListItemProps {
  item: AccessItem;
}

const AccessListItem = React.memo(({ item }: AccessListItemProps) => (
  <li className="flex items-center gap-2">
    <span className={STYLES.bullet} />
    <span>{item.text}</span>
  </li>
));
AccessListItem.displayName = 'AccessListItem';

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader = React.memo(({ userName }: DashboardHeaderProps) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome back, {userName}!</p>
  </div>
));
DashboardHeader.displayName = 'DashboardHeader';

const AccessSection = React.memo(() => (
  <div className="mt-8 bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Parent Access</h2>
    <ul className="space-y-2 text-gray-600">
      {ACCESS_ITEMS.map((item, index) => (
        <AccessListItem key={index} item={item} />
      ))}
    </ul>
  </div>
));
AccessSection.displayName = 'AccessSection';

const ParentDashboard: React.FC = () => {
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

        <AccessSection />
      </div>
    </div>
  );
};

export default ParentDashboard;