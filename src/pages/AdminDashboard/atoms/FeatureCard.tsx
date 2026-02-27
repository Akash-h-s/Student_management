import React from 'react';
import { Link } from 'react-router-dom';
import type { Feature } from '../types';

interface FeatureCardProps {
    feature: Feature;
}

export const FeatureCard = React.memo(({ feature }: FeatureCardProps) => {
    const Icon = feature.icon;

    return (
        <Link
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
});
FeatureCard.displayName = 'FeatureCard';
