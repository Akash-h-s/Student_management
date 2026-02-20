import React from 'react';
import { Link } from 'react-router-dom';
import type { Feature } from '../types';
import { STYLES } from '../constants';

interface FeatureCardProps {
    feature: Feature;
}

export const FeatureCard = React.memo(({ feature }: FeatureCardProps) => {
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
