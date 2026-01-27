import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  const features = [
    {
      title: 'Upload Student Data',
      description: 'Upload student lists via Excel or PDF',
      icon: Upload,
      link: '/admin/upload',
      color: 'bg-blue-500',
    },
    {
      title: 'Upload Teacher Data',
      description: 'Upload teacher lists via Excel or PDF',
      icon: Users,
      link: '/admin/upload', // Note: Both point to same path currently
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                to={feature.link}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer block"
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}